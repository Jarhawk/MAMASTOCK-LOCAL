// scripts/sqlite-apply.js (ESM)
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// Emplacement DB final (déjà utilisé dans le projet)
const DB_PATH = process.env.MS_DB_PATH
  || path.join(process.env.USERPROFILE || process.env.HOME, "MamaStock", "data", "mamastock.db");

const SQL_DIR = path.join(process.cwd(), "db", "sqlite");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function listSqlFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".sql"))
    .sort((a,b) => a.localeCompare(b)); // 001_, 002_, 003_...
}

function readSql(file) {
  let sql = fs.readFileSync(file, "utf8");
  // enlever BOM éventuel + commentaires /* ... */ et // ... en fin de ligne
  if (sql.charCodeAt(0) === 0xFEFF) sql = sql.slice(1);
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, "");
  sql = sql.replace(/(^|[^:])\/\/.*$/gm, "$1");
  return sql.trim();
}

function alreadyApplied(db, filename) {
  try {
    db.prepare(`CREATE TABLE IF NOT EXISTS __migrations__ (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )`).run();
    const row = db.prepare(`SELECT 1 FROM __migrations__ WHERE filename=?`).get(filename);
    return !!row;
  } catch (e) { throw e; }
}

function markApplied(db, filename) {
  db.prepare(`INSERT OR IGNORE INTO __migrations__ (filename, applied_at)
              VALUES (?, datetime('now'))`).run(filename);
}

function main() {
  ensureDir(path.dirname(DB_PATH));
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const files = listSqlFiles(SQL_DIR);
  for (const f of files) {
    const full = path.join(SQL_DIR, f);

    if (alreadyApplied(db, f)) {
      console.log(`skip ${f} (déjà appliqué)`);
      continue;
    }

    const sql = readSql(full);
    if (!sql) { console.log(`skip ${f} (vide)`); continue; }

    const txn = db.transaction(() => db.exec(sql));
    try {
      txn();
      markApplied(db, f);
      console.log(`applied ${path.join("db/sqlite", f)}`);
    } catch (e) {
      console.error(`\nFAILED on ${f}\n${e.message}`);
      db.close();
      process.exit(1);
    }
  }

  console.log(`OK: ${DB_PATH}`);
  db.close();
}

main();

