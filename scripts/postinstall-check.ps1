Param(
  [string]$DataDir = "$env:USERPROFILE\MamaStock\data",
  [string]$AppDataDir = "$env:APPDATA\MamaStock"
)

$ErrorActionPreference = 'Stop'
$exitCode = 0

function Test-Tool {
  param(
    [string]$Name,
    [ScriptBlock]$Cmd
  )
  try {
    $result = & $Cmd
    if ($result) {
      Write-Host "$Name: $result" -ForegroundColor Green
    } else {
      Write-Host "$Name OK" -ForegroundColor Green
    }
  } catch {
    Write-Host "$Name KO" -ForegroundColor Red
    $script:exitCode = 1
  }
}

Test-Tool 'Node' { node --version }
Test-Tool 'npm' { npm --version }
Test-Tool 'Rust (MSVC)' {
  $host = (& rustc -Vv) | Where-Object { $_ -like 'host:*' }
  if ($host -notmatch 'msvc') { throw "host $host" }
}
Test-Tool 'WebView2' {
  Get-ItemPropertyValue -Path 'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F1FDD2EA-9555-4F2B-86A5-EBE55007A7E2}' -Name 'pv' | Out-Null
}

Write-Host "Data directory: $DataDir"
Write-Host "App data directory: $AppDataDir"

$configPath = Join-Path $AppDataDir 'config.json'
$dbPath = Join-Path $DataDir 'mamastock.db'

Write-Host "Config file: $configPath"
Write-Host "Database file: $dbPath"

if (Test-Path $configPath) {
  Write-Host 'config.json present.' -ForegroundColor Green
} else {
  Write-Warning 'config.json missing.'
}

if (Test-Path $dbPath) {
  try {
    [IO.File]::OpenRead($dbPath).Close()
    Write-Host 'Database accessible.' -ForegroundColor Green
  } catch {
    Write-Host "Database not readable: $_" -ForegroundColor Red
    $exitCode = 1
  }
} else {
  Write-Warning 'Database not found. Running npm run db:apply...'
  try {
    npm run db:apply | Out-Host
    if (Test-Path $dbPath) {
      Write-Host "Database created at $dbPath." -ForegroundColor Green
    } else {
      Write-Host 'Database creation failed.' -ForegroundColor Red
      $exitCode = 1
    }
  } catch {
    Write-Host "npm run db:apply failed: $_" -ForegroundColor Red
    $exitCode = 1
  }
}

exit $exitCode

