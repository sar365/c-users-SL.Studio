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

    /// <summary>
    /// Returns the input channel names exposed by an ASIO driver, in driver order.
    /// Opens the driver briefly, so this must be called from the UI (STA) thread.
    /// </summary>
    public IReadOnlyList<string> GetAsioInputChannelNames(string driverName)
    {
        try
        {
            using var driver = new AsioOut(driverName);
            var names = new List<string>(driver.DriverInputChannelCount);
            for (var i = 0; i < driver.DriverInputChannelCount; i++)
            {
                var name = driver.AsioInputChannelName(i);
                names.Add(string.IsNullOrWhiteSpace(name) ? $"Input {i + 1}" : name);
            }

            return names;
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public void Dispose() => _enumerator.Dispose();
}
