param(
  [string]$WixRoot = "$env:LOCALAPPDATA\tauri\WixTools314"
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Get-Location).Path
$assetsDir = Join-Path $repoRoot 'src-tauri\installer\wix'
$mainWxs = Join-Path $assetsDir 'main.wxs'
$uiWxs = Join-Path $assetsDir 'ui-custom.wxs'
$releaseDir = (Resolve-Path (Join-Path $repoRoot 'src-tauri\target\release')).Path
$bundleDir = Join-Path $releaseDir 'bundle\msi'
$logDir = Join-Path $bundleDir 'logs'
$objDir = Join-Path $bundleDir 'obj'

$requiredTools = @('candle.exe', 'light.exe') | ForEach-Object { Join-Path $WixRoot $_ }
foreach ($tool in $requiredTools) {
  if (-not (Test-Path $tool)) {
    throw "WiX tool not found at $tool"
  }
}

$dialogBmp = Join-Path $assetsDir 'dialog.bmp'
if (-not (Test-Path $dialogBmp)) {
  throw "Missing dialog.bmp in $assetsDir"
}

New-Item -ItemType Directory -Force -Path $bundleDir, $logDir, $objDir | Out-Null
Get-ChildItem $objDir -Include *.wixobj, *.wixpdb -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$exe = Get-ChildItem $releaseDir -Filter *.exe -Recurse |
  Where-Object { $_.Name -notmatch '(?i)(setup|unins)' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $exe) {
  throw "No application executable found under $releaseDir. Run 'tauri build' first."
}

$appExePath = $exe.FullName

$candleLog = Join-Path $logDir 'candle.log'
$lightLog = Join-Path $logDir 'light.log'

if (Test-Path $candleLog) { Remove-Item $candleLog -Force }
if (Test-Path $lightLog) { Remove-Item $lightLog -Force }

$mainObj = Join-Path $objDir 'main.wixobj'
$uiObj = Join-Path $objDir 'ui-custom.wixobj'

& (Join-Path $WixRoot 'candle.exe') -nologo -ext WixUIExtension -ext WixUtilExtension -arch x64 -dAppExePath="$appExePath" -out $mainObj $mainWxs 2>&1 |
  Tee-Object -FilePath $candleLog | Out-Null
if ($LASTEXITCODE) {
  throw "candle.exe failed for main.wxs (see $candleLog)"
}

& (Join-Path $WixRoot 'candle.exe') -nologo -ext WixUIExtension -ext WixUtilExtension -arch x64 -out $uiObj $uiWxs 2>&1 |
  Tee-Object -FilePath $candleLog -Append | Out-Null
if ($LASTEXITCODE) {
  throw "candle.exe failed for ui-custom.wxs (see $candleLog)"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$msiOutput = Join-Path $bundleDir ("MAMASTOCK_{0}_x64_user.msi" -f $timestamp)

& (Join-Path $WixRoot 'light.exe') -nologo -ext WixUIExtension -ext WixUtilExtension -b $assetsDir -out $msiOutput $mainObj $uiObj 2>&1 |
  Tee-Object -FilePath $lightLog | Out-Null
if ($LASTEXITCODE) {
  throw "light.exe failed (see $lightLog)"
}

Write-Host "MSI generated -> $msiOutput" -ForegroundColor Green
Write-Host "Logs:" -ForegroundColor DarkGray
Write-Host "  candle: $candleLog" -ForegroundColor DarkGray
Write-Host "  light : $lightLog" -ForegroundColor DarkGray
