using System.IO;
using SLSTUDIO.AudioEngine;
using NAudio.Wave;

namespace SLSTUDIO.Recording;

internal sealed class AsyncWaveFileWriter
{
    private readonly AudioBuffer _buffer;
    private readonly string _path;
    private readonly WaveFormat _format;
    private long _bytesWritten;

    public AsyncWaveFileWriter(AudioBuffer buffer, string path, WaveFormat format)
    {
        _buffer = buffer ?? throw new ArgumentNullException(nameof(buffer));
        _path = path ?? throw new ArgumentNullException(nameof(path));
        _format = format ?? throw new ArgumentNullException(nameof(format));
    }

    public long BytesWritten => Interlocked.Read(ref _bytesWritten);

    public async Task WriteAllAsync(CancellationToken cancellationToken = default)
    {
        WaveFileWriter? writer = null;
        try
        {
            var directory = Path.GetDirectoryName(_path);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            writer = new WaveFileWriter(_path, _format);

            await foreach (var chunk in _buffer.ReadAllAsync(cancellationToken).ConfigureAwait(false))
            {
                try
                {
                    writer.Write(chunk.Buffer, 0, chunk.Count);
                    Interlocked.Add(ref _bytesWritten, chunk.Count);
                }
                finally
                {
                    chunk.Return();
                }
            }

            writer.Flush();
        }
        catch (Exception ex)
        {
            _buffer.Complete(ex);
            throw;
        }
        finally
        {
            try
            {
                writer?.Dispose();
            }
            finally
            {
                _buffer.DrainAndReturn();
            }
        }
    }
}
