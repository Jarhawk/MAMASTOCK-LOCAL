Param(
  [string]$DataDir = "$env:USERPROFILE\MamaStock\data",
  [string]$AppDataDir = "$env:APPDATA\MamaStock"
)

$ErrorActionPreference = 'Stop'

try {
  # App data directory
  if ([string]::IsNullOrWhiteSpace($AppDataDir)) {
    Write-Warning 'AppDataDir not specified (APPDATA missing).'
  } else {
    if (-not (Test-Path $AppDataDir)) {
      Write-Warning "Directory $AppDataDir not found. Creating..."
      New-Item -ItemType Directory -Force -Path $AppDataDir | Out-Null
    } else {
      Write-Host "Directory $AppDataDir exists." -ForegroundColor Green
    }
    $configPath = Join-Path $AppDataDir 'config.json'
    if (Test-Path $configPath) {
      Write-Host "config.json found at $configPath." -ForegroundColor Green
      $configExists = $true
    } else {
      Write-Warning "config.json not found at $configPath."
      $configExists = $false
    }
  }

  # Database check
  if ([string]::IsNullOrWhiteSpace($DataDir)) {
    Write-Warning 'DataDir not specified (USERPROFILE missing).'
  }
  $dbPath = Join-Path $DataDir 'mamastock.db'
  if (Test-Path $dbPath) {
    Write-Host "Database found at $dbPath." -ForegroundColor Green
    $dbExists = $true
  } else {
    Write-Warning "Database not found at $dbPath."
    $dbExists = $false
  }

  if ($configExists -or $dbExists) {
    Write-Host 'Post-installation check passed.' -ForegroundColor Green
    exit 0
  } else {
    Write-Host 'Application appears to have never been launched. Run it once before rerunning this check.' -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
