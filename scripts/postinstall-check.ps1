$ErrorActionPreference = 'Stop'

Write-Host 'Checking config.json...'
$configPath = Join-Path $env:APPDATA 'MamaStock\config.json'
if (-not (Test-Path $configPath)) {
  Write-Error "config.json not found at $configPath"
  exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json
$dataDir = $config.dataDir
if (-not $dataDir) {
  $dataDir = Join-Path $env:USERPROFILE 'MamaStock\data'
}

$dbPath = Join-Path $dataDir 'mamastock.db'
Write-Host "Checking database at $dbPath..."
if (-not (Test-Path $dbPath)) {
  Write-Error "Database not found at $dbPath"
  exit 1
}

$appPath = Join-Path $env:LOCALAPPDATA 'Programs\MamaStock\MamaStock.exe'
if (-not (Test-Path $appPath)) {
  $appPath = 'MamaStock'
}

Write-Host 'Launching application...'
$proc = Start-Process -FilePath $appPath -Wait -PassThru -WindowStyle Hidden
if ($proc.ExitCode -ne 0) {
  Write-Error "Application exited with code $($proc.ExitCode)"
  exit $proc.ExitCode
}

Write-Host 'Post-installation check passed.'

