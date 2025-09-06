# One-click build script for Windows

# Ensure script runs as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Please run this script as Administrator."
    exit 1
}

# Log everything to build.log
$logPath = Join-Path $PSScriptRoot 'build.log'
Start-Transcript -Path $logPath -Append | Out-Null

try {
    Set-Location -Path $PSScriptRoot

    $packages = @(
        'Node.js.LTS',
        'Rustlang.Rustup',
        'Microsoft.VisualStudio.2022.BuildTools',
        'WiXToolset.WiXToolset'
    )

    foreach ($pkg in $packages) {
        winget install -e --id $pkg --accept-package-agreements --accept-source-agreements -h
    }

    npm ci
    # Generate application icons
    npm run icon:gen
    npm run build
    npx tauri build

    $bundlePath = Join-Path $PSScriptRoot 'src-tauri\\target\\release\\bundle'
    Write-Host "Bundle generated in: $bundlePath"
}
finally {
    Stop-Transcript | Out-Null
}

