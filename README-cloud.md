# MamaStock Cloud
⚠️ Ce logiciel est propriétaire. Toute utilisation, copie ou distribution sans licence commerciale valide est interdite.

Documentation pour l'ancienne version connectée au backend cloud PostgreSQL.

L’accès est maintenant géré localement via une table `utilisateurs` stockée dans `src/db/users.json`.
Un script `npm run seed:admin` permet de créer l’utilisateur initial `admin@mamastock.local`.

React application using local authentication. The toolchain relies on modern ESM modules and
requires **Node.js 18+** (see `package.json` engines field).

## Development

```bash
npm install
npm run dev
npm run lint
npm test
npm run test:e2e
npm run build
npm run preview
npm run sanitize:src
```

Run `npm run sanitize:src` to strip BOM, NBSP, and Unicode line separators from source files.

If linting or tests fail because required packages are missing, simply run
`npm install` again. This ensures `tesseract.js`, `vitest`, `@eslint/js` and
`playwright` are available before running the commands above.

## Release

To create a Windows installer:

1. Commit your changes and bump the version if needed.
2. Tag the commit with a `v*` version:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions builds MSI and EXE installers with Tauri and attaches them to a release.

### One-click build

On Windows 11 you can double-click `build.ps1` to install Node.js LTS, Rustup,
Visual Studio Build Tools and the WiX Toolset via `winget`, then run `npm ci`,
`npm run build` and `npx tauri build`. The script logs output to `build.log`
and prints the path to the generated installer bundle.

During production builds, `console.debug` output is automatically disabled so
the browser console stays clean. Use the `DEV` mode if you need verbose debug information.

Product pages also set the browser tab title automatically for easier navigation.

### Branding & PWA

The interface uses a reusable `MamaLogo` component for consistent branding.
The default router redirects unauthenticated visitors from `/` to `/login` and
shows the dashboard when logged in. `index.html` contains PWA metadata with the
favicon, manifest and splash screen so you can install the app on mobile.

### Liquid glass theme

The UI uses an animated "liquid glass" look across every page. Waves and
bubble particles are rendered behind glass panels and dialogs, with a glow that
follows the mouse on desktop and a ripple effect on mobile. A preview of the
theme can be enabled by appending `?preview` to the URL on the home or login
pages. Colours adapt automatically to light or dark mode through the
`ThemeProvider`.

Background animations accept an optional `intensity` prop so pages can tune
the opacity of the glow. When previewing, you can also append
`&intensity=1.5` (for example) to the URL to increase or decrease the
transparency.

Reusable components `LiquidBackground`, `WavesBackground`, `MouseLight` and
`TouchLight` are available under `src/components/LiquidBackground`. Include
them at the root of a page or layout to display the animated waves, bubble
particles and interactive lights.

Le script `src/registerSW.js` enregistre automatiquement un service worker pour activer l'usage hors ligne. Lancez `npm run preview` ou servez le dossier `dist` pour vérifier que l'enregistrement fonctionne.
### Database

SQL migrations are stored in [`db/sqlite`](./db/sqlite). To initialise the local
database used by MamaStock Local, run:

```bash
npm run db:apply
```

This command applies every SQL script in `db/sqlite` to the database file
defined by `MS_DB_PATH` (defaults to `var/mamastock.db`).

The `zones_stock` table uses a `position` column to preserve the display order
of zones. Ensure this column exists and is populated before running the app.

### Environment variables

Copy `.env.example` to `.env` at the project root and adjust the database path or
API endpoints to match your installation. For development this repository
already includes defaults that rely solely on the local adapter:

```env
VITE_API_URL=http://127.0.0.1:8787
DATABASE_URL=sqlite:./db/mamastock.dev.sqlite
```
