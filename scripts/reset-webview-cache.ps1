$ErrorActionPreference = 'SilentlyContinue'

# Close running MamaStock processes (best effort)
Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like '*mamastock*' } | ForEach-Object {
    try {
        $_.CloseMainWindow() | Out-Null
        Start-Sleep -Milliseconds 500
        if (-not $_.HasExited) {
            $_.Kill()
        }
    } catch {}
}

$paths = @(
    (Join-Path $env:LOCALAPPDATA 'com.mamastock.local\WebView2'),
    (Join-Path $env:LOCALAPPDATA 'MamaStock Local\WebView2')
)

$removed = @()

foreach ($path in $paths) {
    if (Test-Path $path) {
        try {
            Remove-Item $path -Recurse -Force -ErrorAction Stop
            $removed += $path
        } catch {}
    }
}

if ($removed.Count -gt 0) {
    Write-Output ("Dossiers supprimés : {0}" -f ($removed -join ', '))
} else {
    Write-Output 'Rien à supprimer'
}
