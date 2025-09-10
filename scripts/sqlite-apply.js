// scripts/sqlite-apply.js
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Database from "better-sqlite3";

function appDataBase() {
  const p = os.platform();
  if (p === "win32") return process.env.APPDATA;
  if (p === "darwin") return path.join(process.env.HOME ?? os.homedir(), "Library", "Application Support");
  return path.join(process.env.HOME ?? os.homedir(), ".config");
}

const base = appDataBase();
const dbFile = path.join(base, "com.mamastock.local", "MamaStock", "data", "mamastock.db");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS __migrations__ (
    filename   TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`);

const migDir = path.join(process.cwd(), "db", "sqlite");
const files = fs.readdirSync(migDir)
  .filter(f => f.endsWith(".sql"))
  .sort();

const hasStmt = db.prepare("SELECT 1 FROM __migrations__ WHERE filename = ?");
const insStmt = db.prepare("INSERT INTO __migrations__ (filename, applied_at) VALUES (?, datetime('now'))");

for (const file of files) {
  if (hasStmt.get(file)) {
    // déjà appliqué
    continue;
  }
  const sql = fs.readFileSync(path.join(migDir, file), "utf8");
  db.exec(sql); // si le SQL est bien idempotent, aucun souci ; sinon, on l’applique une seule fois
  insStmt.run(file);
  console.log("applied", path.join("db/sqlite", file));
}

console.log("OK:", dbFile);
