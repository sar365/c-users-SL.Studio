# SL.STUDIO — Lossless Audio & DJ Set Recorder

SL.STUDIO records the selected Windows playback output or an ASIO input to uncompressed WAV files for DJ sets and live sessions. The recorder does not add a lossy codec or resample the captured stream; the final signal can still be affected by the source app, Windows audio mixer, drivers, and device processing, so end-to-end bit-perfect capture is not guaranteed.

## Features

- **Uncompressed PCM WAV Output**: The recording path adds no lossy codec; the signal still depends on the source app, Windows mixer, drivers, and device processing.
- **Dedicated Background Disk Writer**: A bounded, pooled buffer and background WAV writer keep disk I/O off the audio capture callback.
- **Real-Time Peak Metering**: Independent left and right peak levels displayed in dBFS.
- **Cross-Platform Mobile Support**: Web companion UI configured for iOS and Android via Capacitor (`com.slstudio.recorder`).
- **Standardized WAV Output**: Recorded files are saved with standard RIFF WAV headers directly to `%USERPROFILE%\Music\SL.STUDIO Sets\`.

## Project Structure

- `src/` - React/TypeScript web app and mobile companion preview with Tailwind CSS and Radix UI.
- `native/DJSetRecorder/` - Native Windows .NET 10 WPF WASAPI loopback recording application (`SLSTUDIO.exe`).
- `android/` - Android Studio project (`com.slstudio.recorder`).
- `ios/` - iOS Xcode project (`com.slstudio.recorder`).
- `e2e-tests/` - Playwright end-to-end test suite.

## Native Windows Engine

### Requirements
- Windows 10 (version 2004+) or Windows 11
- .NET 10 SDK or Visual Studio 2022 with the .NET desktop development workload

### Publish Single-File Executable
```bash
cd native/DJSetRecorder
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -o ./bin/publish/win-x64
```
The compiled standalone executable will be located in `bin/publish/win-x64/SLSTUDIO.exe`.
