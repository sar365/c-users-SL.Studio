# SL.STUDIO — Lossless Audio & DJ Set Recorder

SL.STUDIO is a modern, bit-perfect live audio recording companion and WASAPI loopback desktop engine built for recording DJ sets, live sessions, and system master output directly without compression or resample degradation.

## Features

- **Lossless PCM Audio Recording**: Direct Core Audio / WASAPI loopback capture without compression or quality loss.
- **Dedicated Background Disk Writer**: Multi-threaded queue that isolates disk I/O from audio capture buffers, preventing dropouts and buffer underruns.
- **Real-Time VU Level Metering**: Peak and RMS dBFS metering with clip detection.
- **Cross-Platform Mobile Support**: Web companion UI configured for iOS and Android via Capacitor (`com.slstudio.recorder`).
- **Standardized WAV Output**: Recorded files are saved with standard RIFF WAV headers directly to `%USERPROFILE%\Music\SL.STUDIO Sets\`.

## Project Structure

- `src/` - React/TypeScript web app and mobile companion preview with Tailwind CSS and Radix UI.
- `native/DJSetRecorder/` - Native Windows .NET 8 WPF WASAPI loopback recording application (`SLSTUDIO.exe`).
- `android/` - Android Studio project (`com.slstudio.recorder`).
- `ios/` - iOS Xcode project (`com.slstudio.recorder`).
- `e2e-tests/` - Playwright end-to-end test suite.

## Native Windows Engine

### Requirements
- Windows 10 (version 2004+) or Windows 11
- .NET 8.0 SDK or Visual Studio 2022

### Publish Single-File Executable
```bash
cd native/DJSetRecorder
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```
The compiled standalone executable will be located in `bin/publish/win-x64/SLSTUDIO.exe`.