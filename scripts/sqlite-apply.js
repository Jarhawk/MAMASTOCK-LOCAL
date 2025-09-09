import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
const root = process.cwd();
const MIGS = [
  "db/sqlite/001_schema.sql",
  "db/sqlite/002_seed.sql",
  "db/sqlite/003_pmp_valeur_stock.sql",
];
const dbFile = path.join(process.env.USERPROFILE, "MamaStock", "data", "mamastock.db");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
for (const mig of MIGS) {
  const sql = fs.readFileSync(path.join(root, mig), "utf8");
  db.exec(sql);
  console.info("applied", mig);
}
console.info("OK:", dbFile);
