# One-click build script for Windows
winget install -e --id Node.js.LTS -h
winget install -e --id Rustlang.Rustup -h
winget install -e --id Microsoft.VisualStudio.2022.BuildTools -h
winget install -e --id WiXToolset.WiXToolset -h

npm ci
npm run build
npx tauri build
