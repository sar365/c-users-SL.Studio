# Build and publish SLSTUDIO native single-file Windows executable

$ErrorActionPreference = "Stop"

$ProjectDir = Join-Path $PSScriptRoot "..\native\DJSetRecorder"
$PublishDir = Join-Path $ProjectDir "bin\publish\win-x64"

Write-Host "Publishing SLSTUDIO (win-x64)..." -ForegroundColor Cyan

dotnet publish $ProjectDir `
    -c Release `
    -r win-x64 `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:EnableCompressionInSingleFile=true `
    -o $PublishDir

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Binary generated at: $PublishDir\SLSTUDIO.exe" -ForegroundColor Green
} else {
    Write-Host "Failed to build SLSTUDIO." -ForegroundColor Red
    exit 1
}