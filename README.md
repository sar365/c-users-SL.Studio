# SL.STUDIO

**Record Windows playback or an ASIO input to WAV.** SL.STUDIO is a native 64-bit Windows recorder for DJ sets, live sessions, and other audio you are authorized to record. Choose WASAPI loopback to capture the default Windows playback endpoint, or choose an installed ASIO driver to record its physical input channels.

[Download the latest release](https://github.com/sar365/c-users-SL.Studio/releases/latest) · [Browse releases](https://github.com/sar365/c-users-SL.Studio/releases) · [Report a bug or ask a question](https://github.com/sar365/c-users-SL.Studio/issues)

[![Build & Release](https://github.com/sar365/c-users-SL.Studio/actions/workflows/build-and-release.yml/badge.svg?branch=main)](https://github.com/sar365/c-users-SL.Studio/actions/workflows/build-and-release.yml)

## Highlights

- **Two capture modes:** WASAPI loopback for the default Windows playback endpoint, or ASIO for an audio interface's physical input channels.
- **Uncompressed WAV output:** the recorder adds no lossy encoding stage to the captured samples.
- **Live monitoring:** view stereo peak levels in dBFS, elapsed recording time, and bytes written.
- **Background file writing:** audio capture and disk writing use separate components so disk writes do not run in the capture callback.
- **Finalized recordings:** after a normal stop, SL.STUDIO closes the WAV writer and renames the completed file from `.djrec` to `.wav`.
- **Self-contained Windows release:** the published executable includes the .NET runtime; there is no separate runtime installation step.

> **About audio quality:** uncompressed WAV describes the file encoding; it does not guarantee bit-perfect capture. The source application, Windows audio mixer, driver, and audio interface can affect the signal before it reaches SL.STUDIO. The recorder does not repair clipping already present in the captured audio.

## Download and verify

1. Download `SLSTUDIO.exe` from the [latest GitHub release](https://github.com/sar365/c-users-SL.Studio/releases/latest). Releases that include a `SLSTUDIO.exe.sha256` file can be verified in PowerShell before running:

   ```powershell
   if (Test-Path .\SLSTUDIO.exe.sha256) {
     $expected = (Get-Content .\SLSTUDIO.exe.sha256 -Raw) -split '\s+' | Select-Object -First 1
     $actual = (Get-FileHash .\SLSTUDIO.exe -Algorithm SHA256).Hash.ToLowerInvariant()
     if ($actual -ne $expected) { throw 'Checksum mismatch — do not run this file.' }
     'Checksum verified.'
   } else {
     Write-Warning 'No checksum file is published for this release.'
   }
   ```

2. Run `SLSTUDIO.exe`. If Windows displays a SmartScreen or unknown-publisher warning, verify that you downloaded it from the official repository and compare the checksum when one is provided. An unsigned executable may show that warning.

## Quick start

1. Connect the audio device you intend to use.
2. Choose a source in **Recording Source**:
   - **WASAPI loopback (default):** capture the default Windows playback endpoint. In Windows Sound settings, make the intended speakers, headphones, DAC, or interface the default output.
   - **ASIO input:** choose an installed ASIO driver and the input channel or pair connected to your source. ASIO records physical inputs on that interface; it does **not** capture audio another application is playing. Some ASIO drivers allow only one application to use them at a time.
3. Play a short test and confirm the meters respond.
4. Select **Start Recording**. Select **Stop Recording** when finished; the app finalizes the WAV file.
5. Select the recordings-folder link in the app to open the destination.

By default, completed files are saved under the Windows **Music** known folder in `SL.STUDIO Sets` (commonly `%USERPROFILE%\Music\SL.STUDIO Sets`). Windows may redirect the Music folder, for example to OneDrive. Files use timestamped names such as `SL.STUDIO_2026-09-25_12-30-00.wav`. An interrupted recording may leave a `.djrec` file instead of a completed WAV.

## System requirements

- 64-bit Windows 10 version 2004 (build 19041) or newer, or Windows 11.
- A Windows playback endpoint for WASAPI loopback, or an installed ASIO driver exposing at least one input channel for ASIO capture.
- No separate .NET runtime installation is needed for the self-contained release executable.

## Web preview

The React site in this repository is a companion preview and setup guide, not a control surface for the Windows desktop recorder. Its optional browser audio test requests **microphone input** from the browser and records a browser-supported format; it does not provide Windows system-audio loopback. Use `SLSTUDIO.exe` for WASAPI or ASIO recording.

## Build from source

### Windows recorder

On Windows, install the .NET 10 SDK, then run from the repository root in PowerShell:

```powershell
dotnet publish .\native\DJSetRecorder\SL.STUDIO.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true `
  -p:EnableCompressionInSingleFile=true `
  -o .\native\DJSetRecorder\bin\publish\win-x64
```

The executable is written to `native/DJSetRecorder/bin/publish/win-x64/SLSTUDIO.exe`. The [`PUBLISHING.md`](PUBLISHING.md) guide includes the automated build scripts and GitHub release workflow.

### Web companion

Install Node.js 22 or newer, then run:

```bash
npm ci
npm run build
npm run lint
npx playwright install chromium
npm run test
```

The production bundle is created in `dist/`.

## Project layout

- `native/DJSetRecorder/` — Windows WPF recorder, WASAPI/ASIO capture, WAV writer, and publish profile.
- `src/` — React companion preview, setup guide, and browser microphone test.
- `android/`, `ios/` — Capacitor project shells.
- `e2e-tests/` — Playwright browser tests.
- `docs/releases/` — versioned release notes.
- [`PUBLISHING.md`](PUBLISHING.md) — build and distribution guide.
- [`SECURITY.md`](SECURITY.md) — vulnerability reporting guidance.

## Support and security

For usage questions or reproducible bugs, [open a GitHub issue](https://github.com/sar365/c-users-SL.Studio/issues). For suspected vulnerabilities, follow [`SECURITY.md`](SECURITY.md) and avoid posting exploit details publicly.

## License

This repository does not currently declare a license. If you intend to allow reuse, modification, or contributions from others, add the appropriate license before inviting them to do so.
