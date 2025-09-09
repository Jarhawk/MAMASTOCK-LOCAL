// Script de remplacement des imports Supabase par les appels au DAL SQLite.
// Ce script parcourt les fichiers listés dans docs/FRONTMAP.md et applique
// quelques remplacements simples pour les fonctionnalités basiques :
//  - CRUD fournisseurs
//  - liste produits
//  - création de facture et ajout de lignes
// Les pages avancées (stats, reporting, RGPD, etc.) restent TODO.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Récupère la liste brute des fichiers mentionnés comme utilisant Supabase
function getSupabaseFiles(): string[] {
  const frontmap = readFileSync(join(process.cwd(), 'docs/FRONTMAP.md'), 'utf8');
  const lines = frontmap.split('\n');
  const files: string[] = [];
  for (const line of lines) {
    const match = line.match(/\(src\/[^)]+\)/);
    if (match) files.push(match[1]);
  }
  return files;
}

function patchFile(file: string) {
  let src = readFileSync(file, 'utf8');
  if (!src.includes('supabase')) return; // rien à faire

  // Remplacement basique de l'import Supabase
  src = src.replace(/import\s+supabase[^;]*;\n?/, "import * as db from '@/lib/db';\n");

  // Fournisseurs
  src = src.replace(
    /await\s+supabase\.from\(['"]fournisseurs['"]\)[^;]*;/g,
    'await db.fournisseurs_list();'
  );
  src = src.replace(
    /supabase\.from\(['"]fournisseurs['"]\)\.insert\(([^)]+)\)/g,
    'db.fournisseurs_create($1)'
  );

  // Produits
  src = src.replace(
    /await\s+supabase\.from\(['"]produits['"]\)[^;]*;/g,
    'await db.produits_list();'
  );

  // Factures
  src = src.replace(
    /supabase\.from\(['"]factures['"]\)\.insert\(([^)]+)\)/g,
    'db.facture_create($1)'
  );
  src = src.replace(
    /supabase\.from\(['"]facture_lignes['"]\)\.insert\(([^)]+)\)/g,
    'db.facture_add_ligne($1)'
  );

  src += '\n// TODO: traiter les autres appels Supabase si nécessaire';

  writeFileSync(file, src, 'utf8');
  console.log(`Patched ${file}`);
}

export function run() {
  const files = getSupabaseFiles();
  const scope = new Set([
    'src/hooks/data/useFournisseurs.js',
    'src/hooks/useProduitsFournisseur.js',
    'src/hooks/useFournisseurStats.js',
  ]);
  // Ajouter les pages ciblées
  files.forEach((f) => {
    if (f.startsWith('src/pages/fournisseurs/') ||
        f.startsWith('src/pages/factures/') ||
        scope.has(f)) {
      try {
        patchFile(f);
      } catch (e) {
        console.warn('Impossible de patcher', f, e);
      }
    }
  });
}

// Exécution directe
if (import.meta.main) run();
