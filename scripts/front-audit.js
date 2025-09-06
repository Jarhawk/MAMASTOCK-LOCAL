import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';

// Script d'audit du front MamaStock Local
// Génère docs/front_map.json et docs/FRONTMAP.md

const racine = process.cwd();
const srcDir = path.join(racine, 'src');

const fichiers = await fg(['src/**/*.{js,jsx,ts,tsx}'], {
  ignore: ['**/node_modules/**', '**/.vite/**', '**/dist/**'],
});

const resultat = {
  routes: [],
  components: [],
  hooks: [],
  contexts: [],
  dataContracts: [],
  envVars: [],
  problems: [],
  todos: [],
};

// mapping composant -> fichier pour les imports lazy
const mappingImports = {};

for (const fichier of fichiers) {
  let contenu;
  try {
    contenu = fs.readFileSync(fichier, 'utf8');
  } catch (e) {
    resultat.problems.push({ type: 'fs', file: fichier, message: 'Lecture impossible' });
    continue;
  }
  const rel = path.relative(racine, fichier);

  // Variables d'environnement Vite
  const envMatches = contenu.matchAll(/import\.meta\.env\.([A-Z0-9_]+)/g);
  for (const m of envMatches) {
    if (!resultat.envVars.includes(m[1])) resultat.envVars.push(m[1]);
  }

  // TODO/FIXME
  const todoMatches = contenu.matchAll(/TODO[:]?([^\n]*)/g);
  for (const m of todoMatches) {
    resultat.todos.push({ file: rel, text: m[0].trim() });
  }

  // Détection Supabase
  if (contenu.includes('supabase.from(')) {
    resultat.problems.push({ type: 'supabase', file: rel, message: 'Référence à supabase' });
  }

  // Contextes React
  if (contenu.includes('createContext(')) {
    const m = contenu.match(/const\s+(\w+)\s*=\s*createContext/);
    const nom = m ? m[1] : 'Context';
    resultat.contexts.push({ name: nom, file: rel });
  }

  // Hooks
  const hooks = contenu.matchAll(/export\s+(?:async\s+)?function\s+(use[A-Z]\w+)/g);
  for (const m of hooks) {
    resultat.hooks.push({ name: m[1], file: rel });
  }
  const hooksDef = contenu.matchAll(/export\s+default\s+(?:async\s+)?function\s+(use[A-Z]\w+)/g);
  for (const m of hooksDef) {
    resultat.hooks.push({ name: m[1], file: rel });
  }

  // Composants
  const comps = contenu.matchAll(/export\s+default\s+(?:async\s+)?function\s+([A-Z][A-Za-z0-9_]*)/g);
  for (const m of comps) {
    resultat.components.push({ name: m[1], file: rel });
  }

  // Imports lazy pour mapping route -> fichier
  const lazyImports = contenu.matchAll(/const\s+(\w+)\s*=\s*lazyWithPreload\(\s*\(\)\s*=>\s*import\(["']([^"']+)["']\)\s*\)/g);
  for (const m of lazyImports) {
    mappingImports[m[1]] = m[2];
  }

  // Routes React Router
  const routes = contenu.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*element={<([^\s>/]+).*?>}/gms);
  for (const m of routes) {
    const p = m[1];
    const comp = m[2];
    const fichierComp = mappingImports[comp] || '';
    const lazy = Boolean(mappingImports[comp]);
    const protege = m[0].includes('ProtectedRoute');
    resultat.routes.push({ path: p, component: comp, file: fichierComp, lazy, protected: protege });
  }

  // Contrats de données simplistes
  const entites = ['produit', 'produits', 'fournisseur', 'fournisseurs', 'facture', 'factures', 'inventaire', 'commande', 'commandes', 'tache', 'taches', 'famille', 'familles', 'role', 'roles', 'utilisateur', 'utilisateurs', 'mama', 'mamas'];
  for (const ent of entites) {
    const reg = new RegExp(ent + '\\.(\\w+)', 'g');
    let m;
    while ((m = reg.exec(contenu)) !== null) {
      let contrat = resultat.dataContracts.find((c) => c.entity === ent);
      if (!contrat) {
        contrat = { entity: ent, fields: [] };
        resultat.dataContracts.push(contrat);
      }
      if (!contrat.fields.includes(m[1])) contrat.fields.push(m[1]);
    }
  }

  // Imports relatifs manquants
  const importRel = contenu.matchAll(/import\s+[^'"\n]+\s+from\s+['"](\.\/[^'"\n]+)['"]/g);
  for (const m of importRel) {
    const imp = m[1];
    const res = path.resolve(path.dirname(fichier), imp);
    const existe = ['.js', '.jsx', '.ts', '.tsx', '', '/index.js', '/index.tsx', '/index.ts', '/index.jsx'].some((ext) => fs.existsSync(res + ext));
    if (!existe) {
      resultat.problems.push({ type: 'import', file: rel, message: `Import introuvable ${imp}` });
    }
  }
}

resultat.envVars.sort();

// Écriture JSON
fs.mkdirSync(path.join(racine, 'docs'), { recursive: true });
fs.writeFileSync(path.join(racine, 'docs/front_map.json'), JSON.stringify(resultat, null, 2), 'utf8');

// Génération Markdown
const pkg = JSON.parse(fs.readFileSync(path.join(racine, 'package.json'), 'utf8'));
let md = '# FRONTMAP\n\n';
md += '## Résumé du projet\n';
md += `- Node: ${pkg.engines?.node || ''}\n`;
md += `- Vite: ${pkg.devDependencies?.vite || ''}\n`;
md += `- Tauri (CLI): ${pkg.devDependencies['@tauri-apps/cli'] || ''}\n\n`;

md += '## Routes & navigation\n\n';
md += '| Chemin | Composant | Fichier | Lazy | Protégé |\n';
md += '|---|---|---|---|---|\n';
for (const r of resultat.routes) {
  md += `| ${r.path} | ${r.component} | ${r.file} | ${r.lazy ? 'oui' : 'non'} | ${r.protected ? 'oui' : 'non'} |\n`;
}

md += '\n## Hooks\n';
for (const h of resultat.hooks) {
  md += `- ${h.name} (${h.file})\n`;
}

md += '\n## Contextes\n';
for (const c of resultat.contexts) {
  md += `- ${c.name} (${c.file})\n`;
}

md += '\n## Variables d\'environnement\n';
for (const v of resultat.envVars) {
  md += `- ${v}\n`;
}

md += '\n## Contrats de données\n';
for (const dc of resultat.dataContracts) {
  md += `- ${dc.entity} : ${dc.fields.join(', ')}\n`;
}

md += '\n## Erreurs potentielles\n';
for (const p of resultat.problems) {
  md += `- [${p.type}] ${p.file} - ${p.message}\n`;
}

md += '\n## TODOs\n';
for (const t of resultat.todos) {
  md += `- ${t.file} - ${t.text}\n`;
}

fs.writeFileSync(path.join(racine, 'docs/FRONTMAP.md'), md, 'utf8');

console.log('Audit front terminé.');
