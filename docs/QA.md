# QA

Exécuter build et dev dans **PowerShell Windows** (Administrateur), pas WSL/Git Bash.

Parcours manuel pour valider une release candidate Windows.

1. Lancer l'application puis se connecter avec l'administrateur créé via `npm run seed:admin`.
2. Créer un fournisseur.
3. Créer un produit.
4. Émettre une facture pour ce fournisseur avec une ligne :
   - quantité : 10
   - prix unitaire : 2.5
   Vérifier ensuite que le produit affiche un stock de 10 et un PMP de 2.5.
5. Exporter les produits en CSV **et** en XLSX, puis sauvegarder la base de données, la restaurer et vérifier le redémarrage de l'application.
6. Tester le verrou distribué : une instance A est ouverte, démarrer une instance B → A se ferme et B prend la main.

## Astuce build Windows

Build local : exécuter `build.ps1` en **PowerShell Administrateur** (pas Git Bash / WSL). S'assurer que **VS Build Tools (C++ x64)** et le **Windows 11 SDK** sont installés ; `where lib.exe` doit répondre.

Pour compiler sous Windows, forcer l'usage exclusif du toolchain Rust MSVC (`x86_64-pc-windows-msvc`) :

```powershell
rustup set default-host x86_64-pc-windows-msvc
rustup toolchain install stable-x86_64-pc-windows-msvc
rustup default stable-x86_64-pc-windows-msvc
```

Assurez-vous qu'aucun élément MSYS/MinGW (comme `git\usr\bin`) ne figure dans `PATH`.
