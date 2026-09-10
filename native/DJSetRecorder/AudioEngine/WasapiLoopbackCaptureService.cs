using NAudio.CoreAudioApi;
using NAudio.Wave;

namespace SLSTUDIO.AudioEngine;

internal sealed class WasapiLoopbackCaptureService : IAudioCaptureService
{
    private readonly WasapiLoopbackCapture _capture;
    private readonly AudioBuffer _buffer;
    private readonly AudioLevelMonitor _levelMonitor = new();
    private readonly TaskCompletionSource _stopped = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private bool _acceptingAudio;

    public WasapiLoopbackCaptureService(MMDevice playbackDevice, AudioBuffer buffer)
    {
        _buffer = buffer;
        _capture = new WasapiLoopbackCapture(playbackDevice);
        _capture.DataAvailable += OnDataAvailable;
        _capture.RecordingStopped += OnRecordingStopped;
    }

    public WaveFormat WaveFormat => _capture.WaveFormat;

    public event EventHandler<StereoLevel>? LevelAvailable;
    public event EventHandler? BufferOverflow;
    public event EventHandler<string>? CaptureWarning;

    public void Start()
    {
        _acceptingAudio = true;
        _capture.StartRecording();
    }

    public async Task StopAsync()
    {
        _acceptingAudio = false;
        try
        {
            if (_capture.CaptureState != CaptureState.Stopped)
            {
                _capture.StopRecording();
            }
            await _stopped.Task.ConfigureAwait(false);
        }
        finally
        {
            _buffer.Complete();
        }
    }

    private void OnDataAvailable(object? sender, WaveInEventArgs args)
    {
        if (!_acceptingAudio || args.BytesRecorded == 0)
        {
            return;
        }

        if (!_buffer.TryWrite(args.Buffer, args.BytesRecorded))
        {
            BufferOverflow?.Invoke(this, EventArgs.Empty);
        }

        if (_levelMonitor.TryMeasure(args.Buffer, args.BytesRecorded, WaveFormat, out var level))
        {
            LevelAvailable?.Invoke(this, level);
        }
    }

    private void OnRecordingStopped(object? sender, StoppedEventArgs args)
    {
        if (args.Exception is not null)
        {
            CaptureWarning?.Invoke(this, $"WASAPI capture stopped: {args.Exception.Message}");
            _stopped.TrySetException(args.Exception);
            return;
        }

        _stopped.TrySetResult();
    }

    public void Dispose()
    {
        _capture.DataAvailable -= OnDataAvailable;
        _capture.RecordingStopped -= OnRecordingStopped;
        _capture.Dispose();
    }
}
