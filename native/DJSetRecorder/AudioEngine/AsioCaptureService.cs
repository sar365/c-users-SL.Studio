using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

internal sealed class AsioCaptureService : IAudioCaptureService
{
    private readonly AsioOut _capture;
    private readonly AudioBuffer _buffer;
    private readonly AudioLevelMonitor _levelMonitor = new();
    private readonly TaskCompletionSource _stopped = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private readonly int _inputChannels;
    private readonly float[] _samples;
    private readonly byte[] _interleavedBuffer;
    private readonly WaveFormat _waveFormat;
    private bool _acceptingAudio;
    private bool _started;

    public AsioCaptureService(string driverName, AudioBuffer buffer)
    {
        if (string.IsNullOrWhiteSpace(driverName))
        {
            throw new ArgumentException("An ASIO driver must be selected.", nameof(driverName));
        }

        _buffer = buffer;
        _capture = new AsioOut(driverName);
        try
        {
            _inputChannels = Math.Min(2, _capture.DriverInputChannelCount);
            if (_inputChannels == 0)
            {
                throw new InvalidOperationException($"ASIO driver '{driverName}' does not expose any input channels.");
            }

            var sampleRate = SelectSampleRate();
            _capture.InitRecordAndPlayback(null, _inputChannels, sampleRate);
            _waveFormat = WaveFormat.CreateIeeeFloatWaveFormat(sampleRate, _inputChannels);
            _samples = new float[_capture.FramesPerBuffer * _inputChannels];
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

    public event EventHandler<StereoLevel>? LevelAvailable;
    public event EventHandler? BufferOverflow;
    public event EventHandler<string>? CaptureWarning;

    public void Start()
    {
        _acceptingAudio = true;
        _started = true;
        _capture.Play();
    }

    public async Task StopAsync()
    {
        _acceptingAudio = false;
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

    private void OnAudioAvailable(object? sender, AsioAudioAvailableEventArgs args)
    {
        if (!_acceptingAudio || args.SamplesPerBuffer == 0)
        {
            return;
        }

        args.GetAsInterleavedSamples(_samples);
        var bytesRecorded = args.SamplesPerBuffer * _inputChannels * sizeof(float);
        Buffer.BlockCopy(_samples, 0, _interleavedBuffer, 0, bytesRecorded);

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
        _capture.AudioAvailable -= OnAudioAvailable;
        _capture.PlaybackStopped -= OnPlaybackStopped;
        _capture.DriverResetRequest -= OnDriverResetRequest;
        _capture.Dispose();
    }
}
