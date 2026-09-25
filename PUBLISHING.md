# SL.STUDIO — Publishing & Distribution Guide

This document contains instructions for building and publishing **SL.STUDIO** across all supported platforms.

---

## 1. Native Windows Desktop Application (`SLSTUDIO.exe`)

The Windows application is a self-contained, single-file `.NET 10` WPF app located in `native/DJSetRecorder/`.

### Automated Local Build
Run either the PowerShell script or Batch script from the project root:

**PowerShell:**
```powershell
.\scripts\publish-windows.ps1
```

**Command Prompt / Batch:**
```cmd
.\scripts\publish-windows.bat
```

### Manual Command Line Build
```bash
cd native/DJSetRecorder
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -o "./bin/publish/win-x64"
```

The output file will be generated at:
```
native/DJSetRecorder/bin/publish/win-x64/SLSTUDIO.exe
```

### Automated GitHub Release
When you push a Git tag starting with `v` (e.g. `git tag v1.0.3 && git push origin v1.0.3`), the included GitHub Actions workflow will compile `SLSTUDIO.exe`, generate its SHA-256 checksum, and publish both as a GitHub Release. Before tagging, add the matching user-facing notes at `docs/releases/<tag>.md` (for example, `docs/releases/v1.0.3.md`); the workflow uses that file as the release body.

---

## 2. Web Application (React / Vite)

### Production Build
```bash
npm run build
```
The production bundle is created in `dist/`.

### Hosting Setup:
- **Vercel**: Push to your repository and import on [Vercel](https://vercel.com). The included `vercel.json` ensures client-side routing works out of the box.
- **Netlify / Cloudflare Pages**:
  - Build command: `npm run build`
  - Publish directory: `dist`

---

## 3. Android Mobile Application (Capacitor)

- **Application ID / Namespace**: `com.slstudio.recorder`
- **Source**: `android/`

### Build & Sync Steps:
1. Build the web app and sync Capacitor:
   ```bash
   npm run cap:sync
   ```
2. Open in Android Studio:
   ```bash
   npm run cap:open:android
   ```
3. In Android Studio:
   - Go to **Build** → **Generate Signed Bundle / APK...**
   - Choose **Android App Bundle (.aab)** (required for Google Play).
   - Select or generate your release keystore.
   - Choose **release** destination folder and build.
4. Upload the generated `.aab` file to the [Google Play Console](https://play.google.com/console).

---

## 4. iOS Mobile Application (Capacitor)

*(Requires macOS with Xcode)*

- **Bundle Identifier**: `com.slstudio.recorder`
- **Source**: `ios/App/`

### Build & Sync Steps:
1. Build the web app and sync Capacitor:
   ```bash
   npm run cap:sync
   ```
2. Open in Xcode:
   ```bash
   npm run cap:open:ios
   ```
3. In Xcode:
   - Under **Signing & Capabilities**, configure your Apple Developer Team.
   - Set the destination device to **Any iOS Device (arm64)**.
   - Go to **Product** → **Archive**.
   - Click **Distribute App** to upload directly to **App Store Connect / TestFlight**.

---

## 5. Pre-Flight Checklist

- [ ] Choose and add the intended project license, and publish any privacy, terms, and support-contact information required by the distribution channel.
- [ ] Version bump in `package.json` (`"version": "1.0.0"`).
- [ ] Version bump in `android/app/build.gradle` (`versionCode` & `versionName`).
- [ ] Version bump in `ios/App/App.xcodeproj`.
- [ ] Version bump in `native/DJSetRecorder/SL.STUDIO.csproj`.
- [ ] Run `npm run test` to verify e2e test suite passes.
- [ ] Build and test the Windows recorder on a real Windows 10/11 playback device; verify start, stop, WAV playback, and output-folder access.
- [ ] Review the release notes and confirm the published executable's SHA-256 checksum.
- [ ] For a public Windows release, sign the executable with the publisher's Authenticode certificate; unsigned downloads can show an unknown-publisher warning.
