@echo off
echo ====================================================
echo  Building SLSTUDIO Single-File Windows Binary
echo ====================================================

set PROJECT_DIR=%~dp0..\native\DJSetRecorder
set PUBLISH_DIR=%PROJECT_DIR%\bin\publish\win-x64

dotnet publish "%PROJECT_DIR%" ^
    -c Release ^
    -r win-x64 ^
    --self-contained true ^
    -p:PublishSingleFile=true ^
    -p:IncludeNativeLibrariesForSelfExtract=true ^
    -p:EnableCompressionInSingleFile=true ^
    -o "%PUBLISH_DIR%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Binary created at: "%PUBLISH_DIR%\SLSTUDIO.exe"
) else (
    echo.
    echo [ERROR] Build failed.
    exit /b %ERRORLEVEL%
)