$ErrorActionPreference = 'Stop'
$exitCode = 0

function Test-Tool {
    param(
        [string]$Name,
        [string]$Cmd
    )
    try {
        Invoke-Expression $Cmd | Out-Null
        Write-Host "$Name OK" -ForegroundColor Green
    } catch {
        Write-Host "$Name KO" -ForegroundColor Red
        $script:exitCode = 1
    }
}

Test-Tool "Node" "node --version"
Test-Tool "Rust" "rustc --version"

try {
    & npm run db:smoke | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration OK" -ForegroundColor Green
    } else {
        Write-Host "Migration KO" -ForegroundColor Red
        $exitCode = 1
    }
} catch {
    Write-Host "Migration KO" -ForegroundColor Red
    $exitCode = 1
}

Test-Tool "Tauri plugins v2" "node scripts/check-tauri-plugins.js"

Test-Tool "SQL plugin Builder" "if (-not (Select-String -Path 'src-tauri/src/main.rs' -Pattern 'tauri_plugin_sql::Builder::default().build' -SimpleMatch)) { throw 'missing' }"
Test-Tool "SQL capabilities" "if (-not (Test-Path 'src-tauri/capabilities/sql.json')) { throw 'missing' }"

exit $exitCode
