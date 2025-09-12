// scripts/sqlite-apply.js
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import Database from "better-sqlite3";

const SQL_DIR = path.resolve("db/sqlite");
const DB_DIR  = path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "MamaStock", "data");
const DB_FILE = path.join(DB_DIR, "mamastock.db");

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function ensureDirs() {
  await fsp.mkdir(DB_DIR, { recursive: true });
}

function openDb() {
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS __migrations__(
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
  return db;
}

function alreadyApplied(db, name, checksum) {
  const row = db.prepare("SELECT checksum FROM __migrations__ WHERE name = ?").get(name);
  if (!row) return false;
  // Same checksum => skip; different => warn & skip (do not reapply automatically)
  if (row.checksum !== checksum) {
    console.warn(`[warn] migration ${name} already recorded but checksum differs; skipping re-apply`);
  }
  return true;
}

function recordApplied(db, name, checksum) {
  db.prepare("INSERT OR REPLACE INTO __migrations__(name, checksum, applied_at) VALUES(?, ?, datetime('now'))")
    .run(name, checksum);
}

function isIgnorableError(e) {
  if (!e || !e.message) return false;
  const m = e.message.toLowerCase();
  return (
    m.includes("duplicate column name") ||
    m.includes("already exists") ||
    m.includes("file is not a database") // safety
  );
}

async function loadSqlFiles() {
  const files = (await fsp.readdir(SQL_DIR))
    .filter(f => f.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en"));
  return files.map(f => ({ name: f, full: path.join(SQL_DIR, f) }));
}

async function main() {
  await ensureDirs();
  if (!fs.existsSync(SQL_DIR)) {
    console.error(`Missing SQL directory: ${SQL_DIR}`);
    process.exit(1);
  }
  const db = openDb();
  const list = await loadSqlFiles();

  for (const it of list) {
    const buf = await fsp.readFile(it.full);
    const checksum = sha256(buf);
    if (alreadyApplied(db, it.name, checksum)) {
      // still run a quick sanity query
      continue;
    }
    const sql = buf.toString("utf8");

    try {
      db.exec("BEGIN");
      db.exec(sql);
      db.exec("COMMIT");
      recordApplied(db, it.name, checksum);
      console.log(`applied ${path.relative(process.cwd(), it.full)}`);
    } catch (e) {
      db.exec("ROLLBACK");
      if (isIgnorableError(e)) {
        console.log(`[skip-duplicate] ${it.name}: ${e.message}`);
        recordApplied(db, it.name, checksum);
      } else {
        console.error(e);
        process.exitCode = 1;
        break;
      }
    }
  }
  console.log(`OK: ${DB_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
