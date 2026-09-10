using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

internal sealed class AudioLevelMonitor
{
    private long _lastUpdateTicks;

    public bool TryMeasure(byte[] buffer, int count, WaveFormat format, out StereoLevel level)
    {
        level = default;
        var now = Environment.TickCount64;
        if (now - Interlocked.Read(ref _lastUpdateTicks) < 66)
        {
            return false;
        }

        Interlocked.Exchange(ref _lastUpdateTicks, now);
        var left = 0f;
        var right = 0f;
        var channels = Math.Max(1, format.Channels);

        if (format.BitsPerSample == 32 && format.Encoding is WaveFormatEncoding.IeeeFloat or WaveFormatEncoding.Extensible)
        {
            for (var offset = 0; offset + 4 <= count; offset += 4)
            {
                var sample = Math.Abs(BitConverter.ToSingle(buffer, offset));
                var channel = (offset / 4) % channels;
                if (channel == 0) left = Math.Max(left, sample);
                if (channel == 1) right = Math.Max(right, sample);
            }
        }
        else if (format.BitsPerSample == 16)
        {
            for (var offset = 0; offset + 2 <= count; offset += 2)
            {
                var sample = Math.Abs(BitConverter.ToInt16(buffer, offset) / 32768f);
                var channel = (offset / 2) % channels;
                if (channel == 0) left = Math.Max(left, sample);
                if (channel == 1) right = Math.Max(right, sample);
            }
        }
        else if (format.BitsPerSample == 24)
        {
            for (var offset = 0; offset + 3 <= count; offset += 3)
            {
                var value = buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
                if ((value & 0x800000) != 0) value |= unchecked((int)0xFF000000);
                var sample = Math.Abs(value / 8388608f);
                var channel = (offset / 3) % channels;
                if (channel == 0) left = Math.Max(left, sample);
                if (channel == 1) right = Math.Max(right, sample);
            }
        }

        if (channels == 1) right = left;
        level = new StereoLevel(Math.Clamp(left, 0, 1), Math.Clamp(right, 0, 1));
        return true;
    }
}

public readonly record struct StereoLevel(float Left, float Right)
{
    public bool IsClipping => Left >= 0.999f || Right >= 0.999f;
}
