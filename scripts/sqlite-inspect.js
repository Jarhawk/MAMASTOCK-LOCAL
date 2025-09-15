// node scripts/sqlite-inspect.js
import fs from "node:fs";
import Database from "better-sqlite3";
import { dbDir, dbFile } from "./paths.js";

function candidatePaths() {
  const forced = process.env.MS_DB_PATH;
  const defaults = dbFile();
  const candidates = [];
  if (forced) candidates.push(forced);
  if (!candidates.includes(defaults)) candidates.push(defaults);
  return candidates;
}

function findDbPath() {
  for (const p of candidatePaths()) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  // par défaut, on retient le premier candidat (même s'il n'existe pas encore) pour message clair
  return candidatePaths()[0];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { sample: 0 };
  for (const a of args) {
    if (a.startsWith("--sample=")) {
      const n = parseInt(a.split("=")[1], 10);
      if (!Number.isNaN(n) && n >= 0) out.sample = n;
    }
  }
  return out;
}

function main() {
  const { sample } = parseArgs();
  const DB_PATH = findDbPath();
  if (!DB_PATH) {
    console.error("❌ Aucun chemin de DB candidat. Définis MS_DB_PATH ou crée la base attendue.");
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error("❌ Base introuvable:", DB_PATH);
    console.error("   - Lance d’abord vos migrations: `npm run db:apply`");
    console.error(`   - Emplacement attendu par défaut: ${dbFile()}`);
    console.error(`   - Dossier AppData cible: ${dbDir()}`);
    console.error("   - Ou définis MS_DB_PATH=CHEMIN\\\\mamastock.db");
    process.exit(1);
  }

  console.log("📦 DB:", DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");

  const tables = db.prepare(`
    SELECT name, type
    FROM sqlite_master
    WHERE type IN ('table','view')
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  if (!tables.length) {
    console.log("ℹ️ Aucune table/vue (hors sqlite_*)");
    db.close();
    return;
  }

  const maxName = Math.max(...tables.map(t => t.name.length), 5);
  console.log("\n=== OBJETS ===");
  for (const t of tables) {
    const pad = (t.name + " ").padEnd(maxName + 2, ".");
    if (t.type === "table") {
      let cnt = "?";
      try {
        const row = db.prepare(`SELECT COUNT(*) AS cnt FROM "${t.name}"`).get();
        cnt = row?.cnt ?? "?";
      } catch {}
      console.log(`${pad} table  | rows=${cnt}`);
      if (sample > 0) {
        try {
          const rows = db.prepare(`SELECT * FROM "${t.name}" LIMIT ?`).all(sample);
          if (rows.length) {
            console.log("  sample:", rows);
          }
        } catch (e) {
          console.log("  (sample error)", String(e?.message || e));
        }
      }
    } else {
      console.log(`${pad} view`);
    }
  }

  db.close();
  console.log("\n✅ Inspect terminé.");
}

main();
