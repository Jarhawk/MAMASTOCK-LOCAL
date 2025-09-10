import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Database from "better-sqlite3";
const root = process.cwd();
const MIGS = [
  "db/sqlite/001_schema.sql",
  "db/sqlite/002_seed.sql",
  "db/sqlite/003_pmp_valeur_stock.sql",
];
function appDataBase() {
  const p = os.platform();
  if (p === "win32") return process.env.APPDATA;
  if (p === "darwin")
    return path.join(
      process.env.HOME ?? os.homedir(),
      "Library",
      "Application Support",
    );
  return path.join(process.env.HOME ?? os.homedir(), ".config");
}

const base = appDataBase();
const dbFile = path.join(
  base,
  "com.mamastock.local",
  "MamaStock",
  "data",
  "mamastock.db",
);
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
for (const mig of MIGS) {
  const sql = fs.readFileSync(path.join(root, mig), "utf8");
  db.exec(sql);
  console.info("applied", mig);
}
console.info("OK:", dbFile);
