# SQL Refactor Report

## Files changed
- `src/lib/sql.ts` – new shared SQLite client and helpers
- `src/lib/types.ts` – centralized interfaces
- `src/lib/dal/produits.ts` – DAL for produits
- `src/lib/dal/fournisseurs.ts` – DAL for fournisseurs
- `src/hooks/useFournisseurs.js` – switched to DAL
- `src/pages/fournisseurs/Fournisseurs.jsx` – diagnostics via DAL
- `src/debug/dbSmoke.ts` – smoke test for database

## Replacements
- Supabase usages replaced: **0** (no occurrences under `src/`)
- Legacy `@/lib/db` functions replaced with DAL: **2** imports

## TODO
- None
