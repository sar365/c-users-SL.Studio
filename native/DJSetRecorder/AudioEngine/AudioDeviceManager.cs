using NAudio.CoreAudioApi;
using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

public sealed class AudioDeviceManager : IDisposable
{
    private readonly MMDeviceEnumerator _enumerator = new();

    public MMDevice GetDefaultPlaybackDevice() =>
        _enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);

    public string GetDefaultPlaybackDeviceName()
    {
        using var device = GetDefaultPlaybackDevice();
        return device.FriendlyName;
    }

    public IReadOnlyList<string> GetAsioDriverNames()
    {
        try
        {
            return AsioOut.GetDriverNames();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public void Dispose() => _enumerator.Dispose();
}
