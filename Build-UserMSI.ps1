param(
  [string]$WixRoot = "$env:LOCALAPPDATA\tauri\WixTools314"
)

$ErrorActionPreference = 'Stop'
$repo    = (Get-Location).Path
$assets  = Join-Path $repo 'src-tauri\installer\wix'
$mainWxs = Join-Path $assets 'main.wxs'
$uiFile  = Join-Path $assets 'ui-custom.wxs'
$wixDir  = Join-Path $repo 'src-tauri\target\release\wix\x64'
$release = (Resolve-Path '.\src-tauri\target\release').Path

if (!(Test-Path (Join-Path $assets 'dialog.bmp'))) { throw "Missing dialog.bmp in $assets" }

# pick first .exe (excluding obvious installers)
$exe = Get-ChildItem $release -Filter *.exe | ? { $_.Name -notmatch 'unins|setup|install' } | Select-Object -First 1
if (-not $exe) { throw "No .exe in $release. Run 'tauri build' first." }
$exeName = $exe.Name
$exePath = $exe.FullName
$upgrade = ([guid]::NewGuid()).Guid  # replace by a stable one once you ship

# inject placeholders
$text = Get-Content $mainWxs -Raw
$text = $text.Replace('APP_EXE_NAME', $exeName).Replace('APP_EXE_ABS_PATH', $exePath).Replace('UPGRADE_CODE_GUID', $upgrade)
Set-Content $mainWxs $text -Encoding UTF8

New-Item -ItemType Directory -Force -Path $wixDir | Out-Null
Get-ChildItem $wixDir -Include *.wixobj,*.wixpdb -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
$custObj = Join-Path $wixDir 'custom_main.wixobj'
$uiObj   = Join-Path $wixDir 'ui-custom.wixobj'

& "$WixRoot\candle.exe" -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -out $custObj (Resolve-Path $mainWxs)
if ($LASTEXITCODE) { throw "Candle failed on main.wxs" }

& "$WixRoot\candle.exe" -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -out $uiObj (Resolve-Path $uiFile)
if ($LASTEXITCODE) { throw "Candle failed on ui-custom.wxs" }

$msiOut = Join-Path $release ("bundle\msi\MAMASTOCK_{0}_x64_user.msi" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
& "$WixRoot\light.exe" -nologo -v -ext WixUIExtension -ext WixUtilExtension -b "$assets" -out "$msiOut" $custObj $uiObj
if ($LASTEXITCODE) { throw "Light failed" }

Write-Host "`nMSI generated -> $msiOut" -ForegroundColor Green
