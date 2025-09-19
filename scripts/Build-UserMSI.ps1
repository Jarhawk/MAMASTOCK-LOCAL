<#
  Build-UserMSI.ps1
  ------------------
  Compile the WiX authoring (main.wxs + ui-custom.wxs) into a per-user MSI.
  The script assumes the Tauri build already produced src-tauri/target/release/mamastock.exe.

  Example:
    powershell -ExecutionPolicy Bypass -File scripts/Build-UserMSI.ps1
#>

[CmdletBinding()]
param(
  [string]$RepoPath = (Get-Location).Path,
  [string]$Configuration = "release",
  [string]$ExecutableName = "mamastock.exe"
)

$ErrorActionPreference = 'Stop'

$resolvedRepo = (Resolve-Path $RepoPath).Path
Write-Host "=== Build-UserMSI ===" -ForegroundColor Cyan
Write-Host "Repo        : $resolvedRepo" -ForegroundColor DarkGray
Write-Host "Configuration: $Configuration" -ForegroundColor DarkGray

$wixRoot   = Join-Path $env:LOCALAPPDATA 'tauri\WixTools314'
$candleExe = Join-Path $wixRoot 'candle.exe'
$lightExe  = Join-Path $wixRoot 'light.exe'
if (-not (Test-Path $candleExe) -or -not (Test-Path $lightExe)) {
  throw "WiX tools not found in $wixRoot. Launch a Tauri build once or install WiX v3 tooling."
}

$assetsDir  = Join-Path $resolvedRepo 'src-tauri\installer\wix'
$mainWxs    = Join-Path $assetsDir 'main.wxs'
$uiWxs      = Join-Path $assetsDir 'ui-custom.wxs'
if (-not (Test-Path $mainWxs) -or -not (Test-Path $uiWxs)) {
  throw "WiX sources missing in $assetsDir"
}

$exePath = Join-Path $resolvedRepo "src-tauri\\target\\$Configuration\\$ExecutableName"
if (-not (Test-Path $exePath)) {
  throw "Tauri executable not found: $exePath. Build the app first (npm run tauri:build or cargo tauri build)."
}

$buildDir = Join-Path $resolvedRepo "src-tauri\\target\\$Configuration\\wixobj"
$null = New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$msiDir    = Join-Path $resolvedRepo "src-tauri\\target\\$Configuration\\bundle\\msi"
$null = New-Item -ItemType Directory -Force -Path $msiDir | Out-Null
$msiPath   = Join-Path $msiDir ("MAMASTOCK_{0}_x64_user.msi" -f $timestamp)
$logPath   = Join-Path $msiDir ("msi-build_{0}.log" -f $timestamp)

$mainObj = Join-Path $buildDir 'main.wixobj'
$uiObj   = Join-Path $buildDir 'ui-custom.wixobj'

Write-Host "[1/3] candle main.wxs" -ForegroundColor Yellow
& $candleExe -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension `
  -dMamaStockExecutable=$exePath `
  -out $mainObj $mainWxs | Tee-Object -Variable candleMain | Out-Null

Write-Host "[2/3] candle ui-custom.wxs" -ForegroundColor Yellow
& $candleExe -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension `
  -out $uiObj $uiWxs | Tee-Object -Variable candleUi | Out-Null

Write-Host "[3/3] light -> $msiPath" -ForegroundColor Yellow
& $lightExe -nologo -ext WixUIExtension -ext WixUtilExtension `
  -b $assetsDir -out $msiPath $mainObj $uiObj `
  -log $logPath | Tee-Object -Variable lightLog | Out-Null

if (-not (Test-Path $msiPath)) {
  throw "MSI build failed (file missing): $msiPath"
}

Write-Host "MSI generated: $msiPath" -ForegroundColor Green
Write-Host "WiX log      : $logPath" -ForegroundColor Green
