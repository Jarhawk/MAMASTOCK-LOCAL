param(
  [string]$WixRoot = "$env:LOCALAPPDATA\tauri\WixTools314"
)

$ErrorActionPreference = 'Stop'

$repo = (Get-Location).Path
$assets = Join-Path $repo 'src-tauri\installer\wix'
$mainTemplate = Join-Path $assets 'main.wxs'
$uiTemplate = Join-Path $assets 'ui-custom.wxs'
$release = (Resolve-Path '.\src-tauri\target\release').Path
$bundleDir = Join-Path $release 'bundle\msi'
$logDir = Join-Path $release 'bundle\logs'
$wixDir = Join-Path $release 'wix'

$dialogBmp = Join-Path $assets 'dialog.bmp'
if (!(Test-Path $dialogBmp)) {
  throw "Missing dialog.bmp in $assets"
}

$wixTools = @('candle.exe', 'light.exe') | ForEach-Object { Join-Path $WixRoot $_ }
foreach ($tool in $wixTools) {
  if (!(Test-Path $tool)) {
    throw "WiX tool not found: $tool"
  }
}

$exe = Get-ChildItem $release -Filter *.exe -Recurse |
  Where-Object { $_.Name -notmatch 'unins|setup|install' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $exe) {
  throw "No application executable found under $release. Run 'tauri build' first."
}

$exeName = $exe.Name
$exePath = $exe.FullName
$escapedExePath = [System.Security.SecurityElement]::Escape($exePath)

$upgradeCode = $env:MAMASTOCK_UPGRADE_CODE
if ([string]::IsNullOrWhiteSpace($upgradeCode)) {
  $upgradeCode = '5A27A3BF-8E49-4C25-BA28-0A5D710654C3'
}

New-Item -ItemType Directory -Force -Path $wixDir, $bundleDir, $logDir | Out-Null
Get-ChildItem $wixDir -Include *.wixobj, *.wixpdb -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$generatedMain = Join-Path $wixDir 'main.generated.wxs'
$templateContent = Get-Content $mainTemplate -Raw
$templateContent = $templateContent.Replace('APP_EXE_NAME', $exeName)
$templateContent = $templateContent.Replace('APP_EXE_ABS_PATH', $escapedExePath)
$templateContent = $templateContent.Replace('UPGRADE_CODE_GUID', $upgradeCode.Trim('{}'))
Set-Content -Path $generatedMain -Value $templateContent -Encoding UTF8

$candleLog = Join-Path $logDir 'candle.log'
$lightLog = Join-Path $logDir 'light.log'
if (Test-Path $candleLog) { Remove-Item $candleLog -Force }
if (Test-Path $lightLog) { Remove-Item $lightLog -Force }

$mainObj = Join-Path $wixDir 'main.wixobj'
$uiObj = Join-Path $wixDir 'ui-custom.wixobj'

& (Join-Path $WixRoot 'candle.exe') -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -out $mainObj $generatedMain 2>&1 |
  Tee-Object -FilePath $candleLog | Out-Null
if ($LASTEXITCODE) {
  throw "candle.exe failed (see $candleLog)"
}

& (Join-Path $WixRoot 'candle.exe') -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -out $uiObj $uiTemplate 2>&1 |
  Tee-Object -FilePath $candleLog -Append | Out-Null
if ($LASTEXITCODE) {
  throw "candle.exe failed for ui-custom.wxs (see $candleLog)"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$msiOut = Join-Path $bundleDir ("MAMASTOCK_{0}_x64_user.msi" -f $timestamp)

& (Join-Path $WixRoot 'light.exe') -nologo -ext WixUIExtension -ext WixUtilExtension -b $assets -out $msiOut $mainObj $uiObj 2>&1 |
  Tee-Object -FilePath $lightLog | Out-Null
if ($LASTEXITCODE) {
  throw "light.exe failed (see $lightLog)"
}

Write-Host "`nMSI generated -> $msiOut" -ForegroundColor Green
Write-Host "Logs:" -ForegroundColor DarkGray
Write-Host "  candle: $candleLog" -ForegroundColor DarkGray
Write-Host "  light : $lightLog" -ForegroundColor DarkGray
