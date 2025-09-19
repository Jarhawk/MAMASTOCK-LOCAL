param(
  [string]$ExeFullPath = (Get-ChildItem -Path "$PSScriptRoot\src-tauri\target\release" -Filter *.exe | Where-Object { $_.Name -notmatch 'setup|installer|unins' } | Select-Object -First 1).FullName
)

$repo    = $PSScriptRoot
$assets  = Join-Path $repo 'src-tauri\installer\wix'
$wixRoot = "$env:LOCALAPPDATA\tauri\WixTools314"
$wixDir  = Join-Path $repo 'src-tauri\target\release\wix\x64'
$release = (Resolve-Path "$repo\src-tauri\target\release").Path

New-Item -ItemType Directory -Force -Path $wixDir | Out-Null
Get-ChildItem $wixDir -Include *.wixobj,*.wixpdb -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue

$custObj = Join-Path $wixDir 'custom_main.wixobj'
$uiObj   = Join-Path $wixDir 'ui-custom.wixobj'

& "$wixRoot\candle.exe" -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -dExeFullPath="$ExeFullPath" -out $custObj (Resolve-Path "$assets\main.wxs")
if ($LASTEXITCODE) { throw "Candle failed: main.wxs" }

& "$wixRoot\candle.exe" -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension -out $uiObj (Resolve-Path "$assets\ui-custom.wxs")
if ($LASTEXITCODE) { throw "Candle failed: ui-custom.wxs" }

$msiOut = Join-Path $release ("bundle\msi\MAMASTOCK_{0}_x64_user.msi" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
& "$wixRoot\light.exe" -nologo -v -ext WixUIExtension -ext WixUtilExtension -b "$assets" -out "$msiOut" $custObj $uiObj
if ($LASTEXITCODE) { throw "Light failed." }

Write-Host "`n✅ MSI per-user -> $msiOut" -ForegroundColor Green
