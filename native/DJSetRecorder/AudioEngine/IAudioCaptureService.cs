using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

internal interface IAudioCaptureService : IDisposable
{
    WaveFormat WaveFormat { get; }

    event EventHandler<StereoLevel>? LevelAvailable;
    event EventHandler? BufferOverflow;
    event EventHandler<string>? CaptureWarning;

    void Start();
    Task StopAsync();
}
