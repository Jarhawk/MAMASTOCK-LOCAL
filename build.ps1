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
        'Microsoft.VisualStudio.2022.BuildTools',
        'WixToolset.WixToolset'
    )

    foreach ($pkg in $packages) {
        if (-not (winget list --id $pkg | Select-String $pkg)) {
            if ($pkg -eq 'Microsoft.VisualStudio.2022.BuildTools') {
                winget install -e --id $pkg --accept-package-agreements --accept-source-agreements --override "--wait --quiet --add Microsoft.VisualStudio.Workload.VCTools"
            } else {
                winget install -e --id $pkg --accept-package-agreements --accept-source-agreements
            }
        }
    }

    npm ci

    if (Select-String '"icon:gen"' -Path package.json -Quiet) {
        npm run icon:gen
    }

    npm run build
    npx tauri build

    $bundlePath = Join-Path $PSScriptRoot 'src-tauri\target\release\bundle'
    Write-Host "Bundle generated in: $bundlePath"
}
finally {
    Stop-Transcript | Out-Null
}
