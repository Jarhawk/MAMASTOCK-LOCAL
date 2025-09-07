# One-click build script for Windows

# Relaunch as administrator if required
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process -FilePath "pwsh" -ArgumentList "-NoProfile","-ExecutionPolicy Bypass","-File","`"$PSCommandPath`"" -Verb RunAs
    exit
}

$ErrorActionPreference = 'Stop'

# Log everything
$logPath = Join-Path $PSScriptRoot 'build.log'
Start-Transcript -Path $logPath -Append | Out-Null

try {
    Set-Location -Path $PSScriptRoot

    rustup set default-host x86_64-pc-windows-msvc
    rustup toolchain install stable-x86_64-pc-windows-msvc
    rustup default stable-x86_64-pc-windows-msvc
    rustc -Vv
    cargo -Vv

    if ($env:PATH -match 'msys|mingw|git\\usr\\bin') {
        Write-Warning 'MSYS/MinGW detected in PATH. Build may fail.'
    }

    $packages = @(
        'OpenJS.NodeJS.LTS',
        'Rustlang.Rustup',
        'WixToolset.WixToolset'
    )

    foreach ($pkg in $packages) {
        if (-not (winget list --id $pkg | Select-String $pkg)) {
            winget install -e --id $pkg --accept-package-agreements --accept-source-agreements
        }
    }

    # VS Build Tools + Windows SDK
    winget install -e --id Microsoft.VisualStudio.2022.BuildTools --source winget --accept-package-agreements --accept-source-agreements
    $vsUrl = "https://aka.ms/vs/17/release/vs_BuildTools.exe"
    $vsExe = "$env:TEMP\\vs_BuildTools.exe"
    Invoke-WebRequest $vsUrl -OutFile $vsExe
    & $vsExe --quiet --wait --norestart --nocache `
        --add Microsoft.VisualStudio.Workload.VCTools `
        --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
        --add Microsoft.VisualStudio.Component.Windows11SDK.22000 `
        --add Microsoft.VisualStudio.Component.Windows11SDK.22621 `
        --add Microsoft.VisualStudio.Component.VC.CMake.Project

    $libPath = (where.exe lib.exe 2>$null | Select-Object -First 1)
    if (-not $libPath) { Write-Error "lib.exe introuvable (VS Build Tools non prêts)"; exit 1 }
    Write-Host "lib.exe détecté : $libPath"
    & vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath | Write-Host

    npm ci

    if (Select-String '"icon:gen"' -Path package.json -Quiet) {
        npm run icon:gen
    }

    npm run build
    npx tauri build

    $bundlePath = Join-Path $PSScriptRoot 'src-tauri\\target\\release\\bundle'
    Write-Host "Bundle generated in: $bundlePath"
}
finally {
    Stop-Transcript | Out-Null
}
