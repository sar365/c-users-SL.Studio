using System.Threading;
using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

internal sealed class AsioCaptureService : IAudioCaptureService
{
    private static readonly TimeSpan NoSignalGracePeriod = TimeSpan.FromSeconds(4);
    private const float SilenceThreshold = 0.0005f;

    private readonly AsioOut _capture;
    private readonly AudioBuffer _buffer;
    private readonly AudioLevelMonitor _levelMonitor = new();
    private readonly TaskCompletionSource _stopped = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private readonly int _inputChannels;
    private readonly float[] _samples;
    private readonly byte[] _interleavedBuffer;
    private readonly WaveFormat _waveFormat;
    private Timer? _signalWatchdog;
    private int _callbackCount;
    private int _signalDetected;
    private bool _acceptingAudio;
    private bool _started;

    public AsioCaptureService(string driverName, int inputChannelOffset, AudioBuffer buffer)
    {
        if (string.IsNullOrWhiteSpace(driverName))
        {
            throw new ArgumentException("An ASIO driver must be selected.", nameof(driverName));
        }

        _buffer = buffer;
        _capture = new AsioOut(driverName);
        try
        {
            var availableInputs = _capture.DriverInputChannelCount;
            if (availableInputs == 0)
            {
                throw new InvalidOperationException($"ASIO driver '{driverName}' does not expose any input channels.");
            }

            inputChannelOffset = Math.Clamp(inputChannelOffset, 0, availableInputs - 1);
            _inputChannels = Math.Min(2, availableInputs - inputChannelOffset);
            _capture.InputChannelOffset = inputChannelOffset;

            var sampleRate = SelectSampleRate();
            _waveFormat = WaveFormat.CreateIeeeFloatWaveFormat(sampleRate, _inputChannels);

            // Many ASIO drivers refuse to stream (or never fire the buffer callback) unless at least one
            // output channel is opened, so feed silence to the first stereo output pair when available.
            IWaveProvider? silentOutput = null;
            if (_capture.DriverOutputChannelCount > 0)
            {
                var outputChannels = Math.Min(2, _capture.DriverOutputChannelCount);
                silentOutput = new SilenceProvider(WaveFormat.CreateIeeeFloatWaveFormat(sampleRate, outputChannels));
            }

            _capture.InitRecordAndPlayback(silentOutput, _inputChannels, sampleRate);

            InputChannelDescription = DescribeInputs(inputChannelOffset);
            _samples = new float[Math.Max(_capture.FramesPerBuffer, 1) * _inputChannels];
            _interleavedBuffer = new byte[_samples.Length * sizeof(float)];

            _capture.AudioAvailable += OnAudioAvailable;
            _capture.PlaybackStopped += OnPlaybackStopped;
            _capture.DriverResetRequest += OnDriverResetRequest;
        }
        catch
        {
            _capture.Dispose();
            throw;
        }
    }

    public WaveFormat WaveFormat => _waveFormat;
    public string InputChannelDescription { get; } = string.Empty;

    public event EventHandler<StereoLevel>? LevelAvailable;
    public event EventHandler? BufferOverflow;
    public event EventHandler<string>? CaptureWarning;

    public void Start()
    {
        _acceptingAudio = true;
        _started = true;
        _capture.Play();
        _signalWatchdog = new Timer(CheckForSignal, null, NoSignalGracePeriod, Timeout.InfiniteTimeSpan);
    }

    public async Task StopAsync()
    {
        _acceptingAudio = false;
        _signalWatchdog?.Dispose();
        try
        {
            if (!_started || _capture.PlaybackState == PlaybackState.Stopped)
            {
                _stopped.TrySetResult();
            }
            else
            {
                _capture.Stop();
            }

            await _stopped.Task.ConfigureAwait(false);
        }
        finally
        {
            _buffer.Complete();
        }
    }

    private string DescribeInputs(int offset)
    {
        var names = new string[_inputChannels];
        for (var i = 0; i < _inputChannels; i++)
        {
            var name = _capture.AsioInputChannelName(offset + i);
            names[i] = string.IsNullOrWhiteSpace(name) ? $"In {offset + i + 1}" : name;
        }

        return string.Join(" / ", names);
    }

    private int SelectSampleRate()
    {
        foreach (var sampleRate in new[] { 48000, 44100, 96000, 88200, 32000 })
        {
            if (_capture.IsSampleRateSupported(sampleRate))
            {
                return sampleRate;
            }
        }

        throw new NotSupportedException($"ASIO driver '{_capture.DriverName}' does not support a standard recording sample rate.");
    }

    private void CheckForSignal(object? state)
    {
        if (!_acceptingAudio)
        {
            return;
        }

        if (Volatile.Read(ref _callbackCount) == 0)
        {
            CaptureWarning?.Invoke(this,
                "The ASIO driver is not delivering audio. Close other applications using this driver (DAWs hold ASIO exclusively) and check the driver's control panel.");
        }
        else if (Volatile.Read(ref _signalDetected) == 0)
        {
            CaptureWarning?.Invoke(this,
                $"ASIO is running but {InputChannelDescription} is silent. Pick the input channels your mixer/interface is connected to. ASIO records the interface's physical inputs, not what other software plays.");
        }
    }

    private void OnAudioAvailable(object? sender, AsioAudioAvailableEventArgs args)
    {
        if (!_acceptingAudio || args.SamplesPerBuffer == 0)
        {
            return;
        }

        Interlocked.Increment(ref _callbackCount);

        var sampleCount = args.SamplesPerBuffer * _inputChannels;
        if (sampleCount > _samples.Length)
        {
            sampleCount = _samples.Length;
        }

        args.GetAsInterleavedSamples(_samples);
        var bytesRecorded = sampleCount * sizeof(float);
        Buffer.BlockCopy(_samples, 0, _interleavedBuffer, 0, bytesRecorded);

        if (_signalDetected == 0)
        {
            for (var i = 0; i < sampleCount; i++)
            {
                if (Math.Abs(_samples[i]) > SilenceThreshold)
                {
                    Volatile.Write(ref _signalDetected, 1);
                    break;
                }
            }
        }

        if (!_buffer.TryWrite(_interleavedBuffer, bytesRecorded))
        {
            BufferOverflow?.Invoke(this, EventArgs.Empty);
        }

        if (_levelMonitor.TryMeasure(_interleavedBuffer, bytesRecorded, _waveFormat, out var level))
        {
            LevelAvailable?.Invoke(this, level);
        }
    }

    private void OnPlaybackStopped(object? sender, StoppedEventArgs args)
    {
        if (args.Exception is not null)
        {
            _stopped.TrySetException(args.Exception);
            return;
        }

        _stopped.TrySetResult();
    }

    private void OnDriverResetRequest(object? sender, EventArgs args) =>
        CaptureWarning?.Invoke(this, "The ASIO driver requested a reset. Stop and restart recording.");

    public void Dispose()
    {
        _acceptingAudio = false;
        _signalWatchdog?.Dispose();
        _capture.AudioAvailable -= OnAudioAvailable;
        _capture.PlaybackStopped -= OnPlaybackStopped;
        _capture.DriverResetRequest -= OnDriverResetRequest;
        _capture.Dispose();
    }
}
