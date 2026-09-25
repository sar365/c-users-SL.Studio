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

The release workflow is `.github/workflows/build-and-release.yml`. **It is on the `polish/windows-release-readiness` branch in open PR #4; merge that PR to enable it on `main`.** Ensure GitHub Actions are enabled for the repository. The release job requests the built-in `GITHUB_TOKEN` permission `contents: write`, so no personal access token or secret is needed for the normal same-repository release.

For each release:

1. Choose the version and update `native/DJSetRecorder/SL.STUDIO.csproj` to match it. Add complete notes at `docs/releases/vX.Y.Z.md`; the release workflow fails if that exact notes file is missing.
2. Build and test the Windows app, check the release notes, and perform the real-hardware acceptance test from the checklist below. The workflow publishes an unsigned executable; Authenticode signing is not currently configured.
3. Commit and push the release preparation to `main`, then create and push an annotated version tag. For example, for the next release after v1.0.2:

   ```bash
   git switch main
   git pull --ff-only origin main
   # Update native/DJSetRecorder/SL.STUDIO.csproj and add docs/releases/v1.0.3.md first.
   git add native/DJSetRecorder/SL.STUDIO.csproj docs/releases/v1.0.3.md
   git commit -m "Prepare v1.0.3 release"
   git push origin main
   git tag -a v1.0.3 -m "SL.STUDIO v1.0.3"
   git push origin v1.0.3
   ```

4. Open the repository's **Actions** tab and inspect the run triggered by the tag. It builds the web app and Windows x64 self-contained executable, generates `SLSTUDIO.exe.sha256`, and publishes a GitHub Release containing both Windows files with `docs/releases/v1.0.3.md` as its release description. A push to `main` or **Run workflow** performs builds; only a `v*` tag creates a release.

---

## 2. Web Application (React / Vite)

### Production Build
```bash
npm run build
```
The production bundle is created in `dist/`.

### GitHub Actions deployment to Vercel

The workflow in `.github/workflows/ci-vercel.yml` runs lint and Playwright tests before deployment, then runs a separate Playwright smoke test against the deployed URL. It deploys previews for same-repository pull requests and production from `main`; pull requests from forks run checks but do not receive Vercel secrets or deployments. It uses the Vercel CLI `--prebuilt` flow, so the Vercel build is deployed without a second build. `vercel.json` disables Vercel's automatic Git deployments to prevent duplicates; GitHub Actions becomes the deployment path.

Before enabling the workflow:

1. Link or import this repository as a Vercel project and confirm its **Root Directory** is the repository root (`.`) and its output/build settings work with Vite.
2. Install the Vercel CLI (`npm install --global vercel`), authenticate with `vercel login`, and run `vercel link` from the repository root. Select the correct team/account and project. The CLI writes `.vercel/project.json`. Read the IDs with:

   ```bash
   node -p "JSON.parse(require('fs').readFileSync('.vercel/project.json', 'utf8')).orgId"
   node -p "JSON.parse(require('fs').readFileSync('.vercel/project.json', 'utf8')).projectId"
   ```

   The first value is the organization/team ID; the second is the project ID. Do not commit `.vercel` if it contains local environment files.
3. Create a Vercel access token scoped to the project/team. In GitHub, open **Settings → Secrets and variables → Actions** and add these repository secrets (never commit the token):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. If Vercel Deployment Protection is enabled, create a **Protection Bypass for Automation** secret in the Vercel project's Deployment Protection settings and store it as the GitHub Actions secret `VERCEL_AUTOMATION_BYPASS_SECRET`. The deployed-site Playwright smoke test uses Vercel's bypass headers only for requests to the tested deployment origin. Leave this secret unset if deployments are public.
5. Merge the workflow and `vercel.json` changes to `main`. Pull requests to `main` run checks, deploy a Vercel preview, and smoke-test the preview; pushes to `main` run checks, deploy to production, and smoke-test production. The deployment URLs appear in the GitHub Actions run summary.
6. Optionally add required reviewers and other deployment protection rules to the GitHub `production` environment.

To disable Vercel's built-in Git deployments, set `"git": { "deploymentEnabled": false }` in `vercel.json` (already included for this workflow). This disables Git-triggered deployments for all branches while leaving the Vercel CLI deploys from GitHub Actions enabled. Remove that setting if you return to Vercel's native Git deployment flow.

If you want Vercel's native Git integration to create deployments instead, do not enable this CLI deployment workflow and remove `git.deploymentEnabled: false` from `vercel.json`; running both deployment systems can deploy the same commit twice.

### Hosting Setup:
- **Vercel**: Link the repository as a project, set the Vite root/output settings, and use the GitHub Actions deployment flow above. The included `vercel.json` configures SPA rewrites and security headers and disables native Git-triggered deployments to prevent duplicates.
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
