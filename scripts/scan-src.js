// ESM - Node >=18
import fs from "fs/promises";
import fssync from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const SRC_DIR = path.resolve(ROOT, "src");
const REPORT_DIR = path.resolve(ROOT, "reports");

// Helpers --------------------------------------------------------------

const SRC_EXTS = [".ts", ".tsx", ".js", ".jsx"];
const INDEX_BASENAMES = ["index"];
const IMPORT_RE = /(?:^|\s)import\s+(?:["']([^"']+)["']|[^'"']+?from\s+["']([^"']+)["'])/gm;
const DYN_IMPORT_RE = /import\s*\(\s*["']([^"']+)["']\s*\)/gm;
const EXPORT_FROM_RE = /export\s+[^;]*?\s+from\s+["']([^"']+)["']/gm;
const ROUTE_PATH_RE = /path\s*:\s*["'`](.*?)["'`]/g;

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function withoutQuery(spec) {
  return spec.split("?")[0].split("#")[0];
}

function isExternal(spec) {
  // external if it doesn't start with './', '../', or alias '@/'
  if (spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("@/")) return false;
  // data URLs / virtuals are external too
  if (/^(data:|virtual:)/.test(spec)) return true;
  // bare specifier -> external
  return true;
}

function isSourceFile(file) {
  return SRC_EXTS.includes(path.extname(file));
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function readText(p) {
  return fs.readFile(p, "utf8");
}

async function writeText(p, txt) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, txt, "utf8");
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function sortBy(a, key) {
  return [...a].sort((x, y) => String(x[key]).localeCompare(String(y[key])));
}

// Resolve --------------------------------------------------------------

async function resolveToFile(fromFile, specRaw) {
  let spec = withoutQuery(specRaw);
  if (spec.startsWith("@/")) {
    spec = "./" + spec.slice(2); // -> relative to SRC
    fromFile = path.join(SRC_DIR, "dummy.js"); // so resolve from SRC
  }
  const fromDir = path.dirname(fromFile);
  let target = spec.startsWith(".") ? path.resolve(fromDir, spec) : spec;

  // external?
  if (!spec.startsWith(".") && !spec.startsWith("./") && !spec.startsWith("../")) {
    return { kind: "external", id: spec };
  }

  // try exact
  if (await exists(target) && fssync.statSync(target).isFile()) {
    return { kind: "file", file: target };
  }
  // try extensions
  for (const ext of SRC_EXTS.concat([".json"])) {
    const p = target + ext;
    if (await exists(p)) return { kind: "file", file: p };
  }
  // try index.* in directory
  if (await exists(target) && fssync.statSync(target).isDirectory()) {
    for (const base of INDEX_BASENAMES) {
      for (const ext of SRC_EXTS.concat([".json"])) {
        const p = path.join(target, base + ext);
        if (await exists(p)) return { kind: "file", file: p };
      }
    }
  }
  // give up
  return { kind: "missing", id: specRaw };
}

// Parse imports --------------------------------------------------------

function parseImports(code) {
  const specs = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(code))) {
    const s = m[1] || m[2];
    if (s) specs.push(s);
  }
  DYN_IMPORT_RE.lastIndex = 0;
  while ((m = DYN_IMPORT_RE.exec(code))) {
    const s = m[1];
    if (s) specs.push(s);
  }
  EXPORT_FROM_RE.lastIndex = 0;
  while ((m = EXPORT_FROM_RE.exec(code))) {
    const s = m[1];
    if (s) specs.push(s);
  }
  return uniq(specs);
}

// Router detection -----------------------------------------------------

async function detectRoutes(routerFile) {
  try {
    const code = await readText(routerFile);
    const paths = [];
    let m;
    ROUTE_PATH_RE.lastIndex = 0;
    while ((m = ROUTE_PATH_RE.exec(code))) {
      if (m[1]) paths.push(m[1]);
    }
    return uniq(paths).sort();
  } catch {
    return [];
  }
}

// Crawl ----------------------------------------------------------------

async function listSourceFiles() {
  const out = [];
  async function walk(dir) {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (isSourceFile(p)) out.push(p);
    }
  }
  await walk(SRC_DIR);
  return out;
}

async function buildGraph() {
  const files = await listSourceFiles();
  const graph = new Map(); // file -> {imports:[], externals:[], miss:[]}
  const allExternals = new Map(); // name -> count

  for (const file of files) {
    const code = await readText(file);
    const specs = parseImports(code);
    const imports = [];
    const externals = [];
    const missing = [];

    for (const s of specs) {
      const res = await resolveToFile(file, s);
      if (res.kind === "file") {
        imports.push(res.file);
      } else if (res.kind === "external") {
        externals.push(res.id);
        allExternals.set(res.id, (allExternals.get(res.id) ?? 0) + 1);
      } else {
        missing.push(res.id);
      }
    }
    graph.set(file, { imports: uniq(imports), externals: uniq(externals), missing: uniq(missing) });
  }

  return { files, graph, allExternals };
}

function reachableFrom(graph, entryFiles) {
  const seen = new Set(entryFiles);
  const stack = [...entryFiles];
  while (stack.length) {
    const cur = stack.pop();
    const node = graph.get(cur);
    if (!node) continue;
    for (const nxt of node.imports) {
      if (!seen.has(nxt)) {
        seen.add(nxt);
        stack.push(nxt);
      }
    }
  }
  return seen;
}

// Front map (optional) -------------------------------------------------

async function readFrontMap() {
  const candidates = [
    path.resolve(ROOT, "front_map.json"),
    path.resolve(SRC_DIR, "front_map.json"),
  ];
  for (const p of candidates) {
    if (await exists(p)) {
      try {
        const raw = await readText(p);
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

// Main -----------------------------------------------------------------

(async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const { files, graph, allExternals } = await buildGraph();

  // Pages under src/pages
  const pages = files
    .filter(f => toPosix(f).includes("/src/pages/"))
    .map(f => path.relative(ROOT, f))
    .sort();

  // Router file candidates
  const routerCandidates = [
    path.resolve(SRC_DIR, "router.tsx"),
    path.resolve(SRC_DIR, "router.jsx"),
    path.resolve(SRC_DIR, "router.ts"),
    path.resolve(SRC_DIR, "router.js"),
  ];
  const routerFile = (await Promise.all(routerCandidates.map(exists)))
    .map((ok, i) => (ok ? routerCandidates[i] : null))
    .find(Boolean);

  const routerPaths = routerFile ? await detectRoutes(routerFile) : [];

  // Entrypoints
  const entryCandidates = [
    path.resolve(SRC_DIR, "main.tsx"),
    path.resolve(SRC_DIR, "main.jsx"),
    ...(routerFile ? [routerFile] : []),
  ].filter(p => fssync.existsSync(p));

  const reachable = reachableFrom(graph, entryCandidates);
  const orphans = files
    .filter(f => !reachable.has(f))
    .map(f => path.relative(ROOT, f))
    .sort();

  // External deps ranking
  const externalList = [...allExternals.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Missing resolves
  const missing = [];
  for (const [file, node] of graph.entries()) {
    for (const m of node.missing) {
      missing.push({ file: path.relative(ROOT, file), spec: m });
    }
  }

  // Sidebar suggestion
  function toSlug(p) {
    return p
      .replace(/^\/+/, "")
      .replace(/\.(tsx?|jsx?)$/, "")
      .replace(/\\/g, "/")
      .split("/")
      .map((seg) => seg.replace(/\s+/g, "-").toLowerCase())
      .join("/");
  }

  const pageSidebar = pages.map(rel => {
    const relPosix = toPosix(rel);
    const afterPages = relPosix.split("/src/pages/")[1] || relPosix;
    const slug = "/" + toSlug(afterPages).replace(/(\/index)?$/, "").replace(/\/$/, "");
    const label = path.basename(afterPages).replace(/\.(tsx?|jsx?)$/,"");
    const group = path.dirname(afterPages);
    return { file: rel, slug, label, group };
  });

  // front_map.json (optional)
  const frontMap = await readFrontMap();

  const report = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    srcDir: SRC_DIR,
    entrypoints: entryCandidates.map(p => path.relative(ROOT, p)),
    routerFile: routerFile ? path.relative(ROOT, routerFile) : null,
    routerPaths,
    pages,
    pageSidebar,
    externals: externalList,
    orphans,
    missing,
    frontMap,
    notes: [
      "Les 'orphans' sont des fichiers non atteints depuis main/router via la chaîne d'import.",
      "La sidebar suggérée est heuristique; croisez avec routerPaths et front_map.json.",
      "Les 'missing' sont des imports non résolus (chemin à corriger, extension manquante, alias?).",
    ],
  };

  // JSON
  await writeText(path.join(REPORT_DIR, "src-inventory.json"), JSON.stringify(report, null, 2));

  // Markdown
  const md = [];
  md.push(`# Inventaire src/ (pages, routes, dépendances)`);
  md.push(`_Généré: ${report.generatedAt}_`);
  md.push("");
  md.push(`**Entrypoints:**`);
  md.push(report.entrypoints.map(p => `- \`${p}\``).join("\n") || "- (aucun)");
  md.push("");
  md.push(`**Router:** ${report.routerFile ? "`" + report.routerFile + "`" : "_non détecté_"} `);
  md.push("");
  md.push(`**Routes détectées (heuristique \`path:\`):**`);
  md.push(report.routerPaths.map(p => `- \`${p}\``).join("\n") || "- (aucune)");
  md.push("");
  md.push(`## Pages (src/pages)`);
  md.push(report.pages.map(p => `- \`${p}\``).join("\n") || "- (aucune)");
  md.push("");
  md.push(`## Sidebar suggérée (heuristique)`);
  if (report.pageSidebar.length) {
    const grouped = {};
    for (const item of report.pageSidebar) {
      grouped[item.group] = grouped[item.group] || [];
      grouped[item.group].push(item);
    }
    for (const [grp, items] of Object.entries(grouped)) {
      md.push(`### ${grp}`);
      md.push(items.map(it => `- **${it.label}** → \`${it.slug}\`  _(file: \`${it.file}\`)_`).join("\n"));
      md.push("");
    }
  } else {
    md.push("- (aucune)");
  }
  md.push("");
  md.push(`## Dépendances externes (imports npm, par fréquence)`);
  md.push(report.externals.map(d => `- \`${d.name}\` × ${d.count}`).join("\n") || "- (aucune)");
  md.push("");
  md.push(`## Orphelins (non atteints depuis main/router)`);
  md.push(report.orphans.map(p => `- \`${p}\``).join("\n") || "- (aucun)");
  md.push("");
  md.push(`## Imports non résolus (à corriger)`);
  md.push(report.missing.map(m => `- \`${m.spec}\`  (dans \`${m.file}\`)`).join("\n") || "- (aucun)");
  md.push("");
  if (report.frontMap) {
    md.push(`## front_map.json (trouvé)`);
    md.push("```json");
    md.push(JSON.stringify(report.frontMap, null, 2));
    md.push("```");
  }
  await writeText(path.join(REPORT_DIR, "src-inventory.md"), md.join("\n"));

  console.log(`\n✅ Scan terminé.\n- ${path.relative(ROOT, path.join(REPORT_DIR, "src-inventory.json"))}\n- ${path.relative(ROOT, path.join(REPORT_DIR, "src-inventory.md"))}\n`);
})().catch((e) => {
  console.error("scan-src failed:", e);
  process.exit(1);
});
