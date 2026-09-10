using System.Buffers;
using System.Threading.Channels;

namespace SLSTUDIO.AudioEngine;

internal sealed class AudioBuffer
{
    private readonly Channel<AudioChunk> _channel;

    public AudioBuffer(int capacity)
    {
        _channel = Channel.CreateBounded<AudioChunk>(new BoundedChannelOptions(capacity)
        {
            SingleReader = true,
            SingleWriter = true,
            FullMode = BoundedChannelFullMode.Wait
        });
    }

    public bool TryWrite(byte[] source, int count)
    {
        var rented = ArrayPool<byte>.Shared.Rent(count);
        Buffer.BlockCopy(source, 0, rented, 0, count);
        var chunk = new AudioChunk(rented, count);

        if (_channel.Writer.TryWrite(chunk))
        {
            return true;
        }

        ArrayPool<byte>.Shared.Return(rented);
        return false;
    }

    public IAsyncEnumerable<AudioChunk> ReadAllAsync(CancellationToken cancellationToken = default) =>
        _channel.Reader.ReadAllAsync(cancellationToken);

    public void Complete(Exception? error = null) => _channel.Writer.TryComplete(error);

    public void DrainAndReturn()
    {
        _channel.Writer.TryComplete();
        while (_channel.Reader.TryRead(out var chunk))
        {
            chunk.Return();
        }
    }
}

internal readonly record struct AudioChunk(byte[] Buffer, int Count)
{
    public void Return() => ArrayPool<byte>.Shared.Return(Buffer);
}
