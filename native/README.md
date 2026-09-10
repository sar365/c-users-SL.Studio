# SL.STUDIO — Record What You Hear (Phase 1)

This directory contains the real Windows recording desktop application. The React project at the repository root is an interactive visual preview and control guide.

## Requirements

- Windows 10 version 2004 or newer, or Windows 11
- Visual Studio 2022 with the .NET desktop development workload (or .NET 8.0 SDK)
- A Windows playback endpoint selected as the default multimedia output for WASAPI
- Optional: an installed ASIO driver with at least one input channel for ASIO recording

## Compile & Publish

Open `SL.STUDIO.csproj` in Visual Studio or compile from terminal:

```bash
cd native/DJSetRecorder
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

The `win-x64` publish profile creates a self-contained single-file Windows build under `bin/publish/win-x64/SLSTUDIO.exe`.

## Implemented Phase 1 path

`WASAPI loopback (default) or selected ASIO input → bounded pooled buffer → dedicated WAV writer task → .wav`

- `AudioDeviceManager` resolves the Core Audio default render endpoint.
- `WasapiLoopbackCaptureService` uses genuine `WasapiLoopbackCapture`; it never opens a capture/microphone endpoint.
- `AsioCaptureService` enumerates installed NAudio ASIO drivers and records the selected driver's first two input channels as floating-point WAV audio.
- `AudioBuffer` keeps capture callbacks short and bounds memory use.
- `AsyncWaveFileWriter` performs file writes away from both the capture callback and UI thread.
- The native Windows mix format is preserved to avoid live resampling or encoding.
- Audio is first written to `.djrec` and renamed to `.wav` only after the WAV header has been finalized.
- Target recordings are stored directly in `%USERPROFILE%\Music\SL.STUDIO Sets\`.

## Phase 1 acceptance test

1. Set the desired speakers, headphones, DAC, or audio interface as the Windows default output.
2. Open `SLSTUDIO.exe` and confirm the friendly device name matches that output.
3. Leave `WASAPI loopback (default)` selected, or choose `ASIO input` and an available ASIO driver.
4. Start recording, play audio in Traktor Pro 4 (or any DJ software), and leave the app running in the background.
5. Stop recording and open the resulting file from `Music\SL.STUDIO Sets`.
6. Confirm stereo audio, duration, and playback match the selected source.