<#  Build-Installer.ps1
    - Build MSI (WiX)
    - (Option) Build EXE bootstrapper (WiX Burn)
    - Signature avec certificat auto-signé
    - (Option) Import cert en magasins machine
    - Lance l’installation

    Exemples rapides :
      # depuis N’IMPORTE OÙ
      .\Build-Installer.ps1 -RepoPath "C:\Users\dark_\Desktop\mamastock.com\MAMASTOCK-LOCAL" -SkipTauriBuild -MakeBundle

      # sans EXE bootstrapper :
      .\Build-Installer.ps1 -RepoPath "..." -SkipTauriBuild
#>

[CmdletBinding()]
param(
  [string]$RepoPath,
  [switch]$MakeBundle,
  [switch]$SkipTauriBuild,
  [string]$Version       = "0.1.0",
  [string]$ProductName   = "MAMASTOCK",
  [string]$Manufacturer  = "Quentin Vanel",
  [string]$ExeName       = "mamastock.exe",
  [switch]$SilentInstall,
  [switch]$TrustCert = $true,
  [string]$CertSubject   = "CN=MAMASTOCK (Local Dev)"
)

$ErrorActionPreference = 'Stop'

# --- Localisation du repo ---
if (-not $RepoPath) { $RepoPath = (Get-Location).Path }
$RepoPath = (Resolve-Path $RepoPath).Path
Write-Host "=== Build-Installer.ps1 ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoPath" -ForegroundColor DarkGray

# --- Chemins projet ---
$wixRoot    = "$env:LOCALAPPDATA\tauri\WixTools314"
$assets     = Join-Path $RepoPath 'src-tauri\installer\wix'
$mainWxs    = Join-Path $assets 'main.wxs'
$wixDir     = Join-Path $RepoPath 'src-tauri\target\release\wix\x64'
$releaseDir = Join-Path $RepoPath 'src-tauri\target\release'
$tauriExe   = Join-Path $releaseDir $ExeName

$msiDir     = Join-Path $releaseDir 'bundle\msi'
$null = New-Item -ItemType Directory -Force -Path $msiDir | Out-Null

$msiName    = "${ProductName}_${Version}_x64_manual.msi"
$msiOut     = Join-Path $msiDir $msiName
$bundleExe  = Join-Path $msiDir "${ProductName}_Setup_x64.exe"

# --- Vérifs de base WiX ---
if (-not (Test-Path "$wixRoot\candle.exe") -or -not (Test-Path "$wixRoot\light.exe")) {
  throw "WiX introuvable dans '$wixRoot'. Ouvre Tauri une fois (il installe WixTools314) ou installe WiX."
}

# --- Dossiers & fichiers WiX ---
$null = New-Item -ItemType Directory -Force -Path $assets | Out-Null

# Si main.wxs manque, on génère un template prêt-à-l’emploi (x64 + icônes + upgrade)
if (-not (Test-Path $mainWxs)) {
  Write-Host "main.wxs manquant -> génération du template." -ForegroundColor Yellow
@"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="$ProductName" Manufacturer="$Manufacturer" Version="$Version" Language="1036" UpgradeCode="{B035F2E7-24E4-4486-A2EB-956DB8291C23}">
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" />
    <MediaTemplate EmbedCab="yes" />

    <MajorUpgrade AllowDowngrades="no" DowngradeErrorMessage="Une version plus récente de $ProductName est déjà installée." />
    <Icon Id="AppIcon" SourceFile="!(bindpath.Assets)\app.ico" />
    <Property Id="ARPPRODUCTICON" Value="AppIcon" />

    <WixVariable Id="WixUILicenseRtf" Value="!(bindpath.Assets)\license-fr.rtf" />
    <WixVariable Id="WixUIBannerBmp"  Value="!(bindpath.Assets)\banner.bmp" />
    <WixVariable Id="WixUIDialogBmp"  Value="!(bindpath.Assets)\dialog.bmp" />

    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFiles64Folder">
        <Directory Id="INSTALLFOLDER" Name="$ProductName">
          <Component Id="C_MainExe" Guid="*" Win64="yes">
            <File Id="F_MainExe" Source="!(bindpath.Bin)\$ExeName" KeyPath="yes"/>
          </Component>
        </Directory>
      </Directory>

      <Directory Id="ProgramMenuFolder">
        <Directory Id="ApplicationProgramsFolder" Name="$ProductName"/>
      </Directory>
      <Directory Id="DesktopFolder"/>
    </Directory>

    <Component Id="C_Shortcuts" Guid="*" Win64="yes" Directory="INSTALLFOLDER">
      <Shortcut Id="StartMenuShortcut" Name="$ProductName" Description="$ProductName"
                Target="[INSTALLFOLDER]$ExeName" Directory="ApplicationProgramsFolder"
                WorkingDirectory="INSTALLFOLDER" Icon="AppIcon"/>
      <Shortcut Id="DesktopShortcut"   Name="$ProductName" Description="$ProductName"
                Target="[INSTALLFOLDER]$ExeName" Directory="DesktopFolder"
                WorkingDirectory="INSTALLFOLDER" Icon="AppIcon"/>
      <RemoveFolder Id="RemoveAppProgramsFolder" Directory="ApplicationProgramsFolder" On="uninstall" />
      <RegistryValue Root="HKCU" Key="Software\$Manufacturer\$ProductName" Name="installed" Type="integer" Value="1" KeyPath="yes" />
    </Component>

    <Feature Id="MainFeature" Title="$ProductName" Level="1">
      <ComponentRef Id="C_MainExe" />
      <ComponentRef Id="C_Shortcuts" />
    </Feature>

    <UIRef Id="WixUI_InstallDir" />
    <Property Id="WIXUI_INSTALLDIR" Value="INSTALLFOLDER" />
  </Product>
</Wix>
"@ | Set-Content $mainWxs -Encoding UTF8
}

# Icône obligatoire
$ico = Join-Path $assets 'app.ico'
if (-not (Test-Path $ico)) {
  throw "Icône manquante: $ico  -> place un .ico ici puis relance."
}

# --- Build Tauri si requis ---
if (-not $SkipTauriBuild -and -not (Test-Path $tauriExe)) {
  Write-Host "`n[1/6] Build Tauri (exe)..." -ForegroundColor Yellow
  Push-Location $RepoPath
  try {
    # Essaye cargo-tauri si dispo, sinon npx
    if (Get-Command cargo-tauri -ErrorAction SilentlyContinue) {
      cargo tauri build --bundles none
    } else {
      npx tauri build --bundles none
    }
  } finally { Pop-Location }
  if (-not (Test-Path $tauriExe)) { throw "Echec build Tauri: exe non trouvé -> $tauriExe" }
} else {
  Write-Host "`n[1/6] Build Tauri sauté (SkipTauriBuild) ou exe déjà présent." -ForegroundColor Yellow
}

# --- Patch (idempotent) & Build MSI ---
Write-Host "[2/6] Compilation MSI..." -ForegroundColor Yellow
$null = New-Item -ItemType Directory -Force -Path $wixDir | Out-Null
Get-ChildItem $wixDir -Include *.wixobj,*.wixpdb -Recurse -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
$custObj = Join-Path $wixDir 'custom_main.wixobj'

& "$wixRoot\candle.exe" -nologo -arch x64 -ext WixUIExtension -ext WixUtilExtension `
  -dVersion=$Version -out $custObj $mainWxs | Out-Host

& "$wixRoot\light.exe" -nologo -v -ext WixUIExtension -ext WixUtilExtension `
  -b Assets="$assets" -b Bin="$releaseDir" -out "$msiOut" "$custObj" | Out-Host

if (-not (Test-Path $msiOut)) { throw "MSI non généré: $msiOut" }
Write-Host "MSI: $msiOut" -ForegroundColor Green

# --- Certificat auto-signé (ou existant) ---
Write-Host "[3/6] Certificat de signature..." -ForegroundColor Yellow
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -eq $CertSubject } |
        Sort-Object NotAfter -Descending | Select-Object -First 1
if (-not $cert) {
  Write-Host "Création certificat auto-signé: $CertSubject" -ForegroundColor DarkYellow
  $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject $CertSubject -CertStoreLocation "Cert:\CurrentUser\My"
}

# Exporte le .cer dans le repo (pas /Temp) pour import facile
$buildDir = Join-Path $RepoPath 'build'
$null = New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
$cer = Join-Path $buildDir 'dev-signing.cer'
Export-Certificate -Cert $cert -FilePath $cer | Out-Null

# (option) faire confiance au cert au niveau machine
if ($TrustCert) {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  if ($isAdmin) {
    Import-Certificate -FilePath $cer -CertStoreLocation Cert:\LocalMachine\Root             | Out-Null
    Import-Certificate -FilePath $cer -CertStoreLocation Cert:\LocalMachine\TrustedPublisher | Out-Null
    Write-Host "Cert importé en LocalMachine\Root + TrustedPublisher." -ForegroundColor Green
  } else {
    Write-Warning "Lance PowerShell **en admin** et exécute pour supprimer l’alerte éditeur :
  Import-Certificate -FilePath `"$cer`" -CertStoreLocation Cert:\LocalMachine\Root
  Import-Certificate -FilePath `"$cer`" -CertStoreLocation Cert:\LocalMachine\TrustedPublisher"
  }
}

# --- Signature ---
Write-Host "[4/6] Signature des binaires..." -ForegroundColor Yellow
$signtool = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\*\bin\*\x64\signtool.exe' -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending | Select-Object -First 1
if (-not $signtool) { throw "signtool.exe introuvable (installe Windows 10/11 SDK)." }

$tp = $cert.Thumbprint
& $signtool.FullName sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $tp "$msiOut" | Out-Host

# --- (Option) EXE bootstrapper (WiX Burn) ---
if ($MakeBundle) {
  Write-Host "[5/6] Bootstrapper EXE..." -ForegroundColor Yellow
  $bundleWxs = Join-Path $assets 'bundle.wxs'
  if (-not (Test-Path $bundleWxs)) {
@"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi"
     xmlns:bal="http://schemas.microsoft.com/wix/BalExtension">
  <Bundle Name="$ProductName Setup" Manufacturer="$Manufacturer"
          Version="$Version" UpgradeCode="{2A9E9B0E-9F0C-4C5A-9C2E-2F0B6E5D9E01}">
    <BootstrapperApplicationRef Id="WixStandardBootstrapperApplication.RtfLicense" />
    <Chain>
      <MsiPackage SourceFile="!(bindpath.Msi)\$msiName" />
    </Chain>
  </Bundle>
</Wix>
"@ | Set-Content $bundleWxs -Encoding UTF8
  }

  $bundleObj = Join-Path $wixDir 'bundle.wixobj'
  & "$wixRoot\candle.exe" -nologo -ext WixBalExtension -ext WixUtilExtension -out $bundleObj $bundleWxs | Out-Host
  & "$wixRoot\light.exe"  -nologo -ext WixBalExtension -ext WixUtilExtension -b Msi="$msiDir" -out $bundleExe $bundleObj | Out-Host
  if (-not (Test-Path $bundleExe)) { throw "EXE bootstrapper non généré: $bundleExe" }
  & $signtool.FullName sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $tp "$bundleExe" | Out-Host
  Write-Host "Bootstrapper EXE: $bundleExe" -ForegroundColor Green
}

# --- Installation ---
Write-Host "[6/6] Installation..." -ForegroundColor Yellow
$msiArgs = @('/i', "`"$msiOut`"", '/norestart')
if ($SilentInstall) { $msiArgs += '/qn' }
Start-Process msiexec -ArgumentList $msiArgs -Wait

Write-Host "`nTerminé ✅" -ForegroundColor Green
Write-Host "MSI: $msiOut" -ForegroundColor DarkGreen
if ($MakeBundle) { Write-Host "EXE: $bundleExe" -ForegroundColor DarkGreen }
