$ErrorActionPreference = 'Stop'

if (-not $IsWindows) {
    Write-Host 'Windows uniquement'
    exit 0
}

$exitCode = 0

function Test-Tool {
    param(
        [string]$Name,
        [ScriptBlock]$Cmd
    )
    try {
        & $Cmd | Out-Null
        Write-Host "$Name OK" -ForegroundColor Green
    } catch {
        Write-Host "$Name KO" -ForegroundColor Red
        $script:exitCode = 1
    }
}

Test-Tool 'Node' { node --version }
Test-Tool 'npm' { npm --version }
Test-Tool 'rustc' { rustc --version }
Test-Tool 'cargo' { cargo --version }
Test-Tool 'VS Build Tools' { vswhere -latest -products * -requires Microsoft.Component.MSBuild -property installationPath | Out-Null }
Test-Tool 'WebView2' { Get-ItemPropertyValue -Path 'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F1FDD2EA-9555-4F2B-86A5-EBE55007A7E2}' -Name 'pv' | Out-Null }
Test-Tool 'Migrations folder' { if (-not (Test-Path 'public/migrations')) { throw 'missing' } }

exit $exitCode
