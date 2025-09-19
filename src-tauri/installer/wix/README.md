# MAMASTOCK per-user MSI

This folder contains the WiX assets used to build the Windows per-user MSI for the MAMASTOCK Tauri application.

## Prerequisites

1. Install the WiX 3.14 tooling in `%LOCALAPPDATA%\tauri\WixTools314` (default location used by the script).
2. Build the Tauri bundle so the latest executable is available under `src-tauri\target\release`:
   ```powershell
   npm install
   npm run build
   npm run tauri build
   ```

## Build the MSI

Run the PowerShell helper from the repository root:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\src-tauri\installer\wix\Build-UserMSI.ps1
```

The script locates the freshest non-installer `.exe`, compiles `main.wxs` and `ui-custom.wxs` with the WiX UI and Util extensions, and links them into a timestamped MSI stored in `src-tauri\target\release\bundle\msi`.

Compilation and linking logs are written to:

- `src-tauri\target\release\bundle\msi\logs\candle.log`
- `src-tauri\target\release\bundle\msi\logs\light.log`

The script prints the full path of the generated MSI when it succeeds.
