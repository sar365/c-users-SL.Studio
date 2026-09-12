using System.IO;
using SLSTUDIO.Recording;
using NAudio.CoreAudioApi;
using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

public enum AudioSourceMode
{
    WasapiLoopback,
    Asio
}

public sealed class RecordingEngine : IDisposable
{
    private readonly AudioDeviceManager _deviceManager = new();
    private readonly RecordingFileManager _fileManager = new();
    private IAudioCaptureService? _capture;
    private AsyncWaveFileWriter? _writer;
    private Task? _writerTask;
    private MMDevice? _device;
    private RecordingPaths _paths = new();

    public bool IsRecording { get; private set; }
    public AudioSourceMode Source { get; set; } = AudioSourceMode.WasapiLoopback;
    public string? AsioDriverName { get; set; }
    /// <summary>Zero-based index of the first ASIO input channel to record (a stereo pair starts here).</summary>
    public int AsioInputChannelOffset { get; set; }
    public string DeviceName { get; private set; } = "Detecting Windows default output…";
    public string FormatDescription { get; private set; } = "WAV";
    public string? CurrentFilePath => IsRecording ? _paths.TemporaryPath : null;
    public long BytesWritten => _writer?.BytesWritten ?? 0;

    public event EventHandler<StereoLevel>? LevelAvailable;
    public event EventHandler<string>? CaptureWarning;

    public string RefreshDefaultDevice()
    {
        DeviceName = _deviceManager.GetDefaultPlaybackDeviceName();
        return DeviceName;
    }

    public IReadOnlyList<string> GetAsioDriverNames() => _deviceManager.GetAsioDriverNames();

    public IReadOnlyList<string> GetAsioInputChannelNames(string driverName) =>
        _deviceManager.GetAsioInputChannelNames(driverName);

    public async Task StartAsync()
    {
        if (IsRecording)
        {
            return;
        }

        _paths = _fileManager.CreatePaths();
        var buffer = new AudioBuffer(capacity: 512);
        try
        {
            if (Source == AudioSourceMode.Asio)
            {
                if (string.IsNullOrWhiteSpace(AsioDriverName))
                {
                    throw new InvalidOperationException("Select an ASIO driver before starting a recording.");
                }

                var asio = new AsioCaptureService(AsioDriverName, AsioInputChannelOffset, buffer);
                _capture = asio;
                DeviceName = $"ASIO • {AsioDriverName} • {asio.InputChannelDescription}";
            }
            else
            {
                _device = _deviceManager.GetDefaultPlaybackDevice();
                DeviceName = _device.FriendlyName;
                _capture = new WasapiLoopbackCaptureService(_device, buffer);
            }

            _capture.LevelAvailable += OnLevelAvailable;
            _capture.BufferOverflow += OnBufferOverflow;
            _capture.CaptureWarning += OnCaptureWarning;

            var format = _capture.WaveFormat;
            FormatDescription = DescribeFormat(format);
            _writer = new AsyncWaveFileWriter(buffer, _paths.TemporaryPath, format);
            _writerTask = _writer.WriteAllAsync();
            _capture.Start();
            IsRecording = true;
        }
        catch
        {
            buffer.Complete();
            if (_writerTask is not null)
            {
                await _writerTask.ConfigureAwait(false);
            }
            CleanupCapture();
            if (File.Exists(_paths.TemporaryPath)) File.Delete(_paths.TemporaryPath);
            throw;
        }
    }

    public async Task<string?> StopAsync()
    {
        if (!IsRecording || _capture is null || _writerTask is null)
        {
            return null;
        }

        IsRecording = false;
        try
        {
            Exception? captureError = null;
            try
            {
                await _capture.StopAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                captureError = ex;
            }

            await _writerTask.ConfigureAwait(false);
            if (captureError is not null)
            {
                throw new IOException($"Audio capture stopped unexpectedly. The partial recording was preserved at {_paths.TemporaryPath}.", captureError);
            }

            File.Move(_paths.TemporaryPath, _paths.FinalPath, overwrite: false);
            return _paths.FinalPath;
        }
        finally
        {
            CleanupCapture();
        }
    }

    private static string DescribeFormat(WaveFormat format)
    {
        var depth = format.Encoding is WaveFormatEncoding.IeeeFloat or WaveFormatEncoding.Extensible && format.BitsPerSample == 32
            ? "32-bit float"
            : $"{format.BitsPerSample}-bit";
        return $"WAV • {format.SampleRate / 1000d:0.#} kHz • {depth}";
    }

    private void OnLevelAvailable(object? sender, StereoLevel level) => LevelAvailable?.Invoke(this, level);

    private void OnBufferOverflow(object? sender, EventArgs args) =>
        CaptureWarning?.Invoke(this, "The disk writer could not keep up. An audio buffer was dropped.");

    private void CleanupCapture()
    {
        if (_capture is not null)
        {
            _capture.LevelAvailable -= OnLevelAvailable;
            _capture.BufferOverflow -= OnBufferOverflow;
            _capture.CaptureWarning -= OnCaptureWarning;
            _capture.Dispose();
            _capture = null;
        }
        _device?.Dispose();
        _device = null;
        _writer = null;
        _writerTask = null;
    }

    private void OnCaptureWarning(object? sender, string warning) =>
        CaptureWarning?.Invoke(this, warning);

    public void Dispose()
    {
        if (IsRecording)
        {
            StopAsync().GetAwaiter().GetResult();
        }
        CleanupCapture();
        _deviceManager.Dispose();
    }
}
