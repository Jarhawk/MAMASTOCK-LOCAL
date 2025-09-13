import fs from "node:fs";
import path from "node:path";

const CAP_DIR = path.join("src-tauri", "capabilities");
const VALID_SQL = new Set([
  "sql:default",
  "sql:allow-load",
  "sql:allow-select",
  "sql:allow-execute",
  "sql:allow-close"
]);

function stripComments(txt) {
  // enlève /* ... */ puis // ... (hors chaînes – simplifié)
  txt = txt.replace(/\/\*[\s\S]*?\*\//g, "");
  txt = txt.replace(/(^|[^:])\/\/.*$/gm, "$1");
  return txt.trim();
}

function readJsonSafe(p) {
  let raw = fs.readFileSync(p);
  // drop UTF-8 BOM
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    raw = raw.subarray(3);
  }
  const txt = stripComments(raw.toString("utf8"));
  return JSON.parse(txt);
}

function writeJsonPretty(p, obj) {
  const txt = JSON.stringify(obj, null, 2);
  fs.writeFileSync(p, Buffer.from(txt, "utf8"));
}

function ensureArray(a) {
  return Array.isArray(a) ? a : [];
}

function normalizeSqlFile(obj, file) {
  const before = JSON.stringify(obj);
  obj.windows = ensureArray(obj.windows);
  if (!obj.windows.includes("main")) obj.windows.push("main");

  let perms = new Set(ensureArray(obj.permissions));
  // enlève tous les sql:deny-* et toutes permissions SQL inconnues
  for (const perm of [...perms]) {
    if (perm.startsWith("sql:deny-")) perms.delete(perm);
    if (perm.startsWith("sql:") && !VALID_SQL.has(perm)) perms.delete(perm);
  }
  // s'assure des permissions minimales
  for (const p of VALID_SQL) perms.add(p);
  obj.permissions = [...perms];

  const after = JSON.stringify(obj);
  return before !== after;
}

function normalizeGenericFile(obj, file) {
  // on ne touche pas aux autres permissions non-sql
  // on retire juste les sql inconnues et sql:deny-*
  const before = JSON.stringify(obj);
  let perms = new Set(ensureArray(obj.permissions));
  for (const perm of [...perms]) {
    if (perm.startsWith("sql:deny-")) perms.delete(perm);
    if (perm.startsWith("sql:") && !VALID_SQL.has(perm)) perms.delete(perm);
  }
  obj.permissions = [...perms];
  return JSON.stringify(obj) !== before;
}

function run() {
  if (!fs.existsSync(CAP_DIR)) {
    console.error("Capabilities folder not found:", CAP_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(CAP_DIR).filter(f => f.endsWith(".json"));
  const report = [];

  for (const name of files) {
    const p = path.join(CAP_DIR, name);
    let obj;
    try {
      obj = readJsonSafe(p);
    } catch (e) {
      report.push({ file: name, error: "JSON parse error: " + e.message });
      continue;
    }

    let changed = false;
    if (name.toLowerCase() === "sql.json") {
      changed = normalizeSqlFile(obj, name);
    } else {
      changed = normalizeGenericFile(obj, name);
    }

    if (changed) {
      writeJsonPretty(p, obj);
      report.push({ file: name, status: "fixed", permissions: obj.permissions });
    } else {
      report.push({ file: name, status: "ok", permissions: obj.permissions });
    }
  }

  // Affichage
  console.log("=== Capabilities normalization report ===");
  for (const r of report) {
    if (r.error) {
      console.log("❌", r.file, "-", r.error);
    } else if (r.status === "fixed") {
      console.log("🛠️", r.file, "->", r.permissions);
    } else {
      console.log("✅", r.file, "->", r.permissions);
    }
  }

  // rappel
  console.log("\nSi build échoue encore, vérifie qu'aucun *.json ne contient `sql:deny-*` ni des permissions sql inconnues.");
}

run();
