// scripts/sqlite-apply.js
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Database from "better-sqlite3";

const SQL_DIR = path.resolve("db/sqlite");

// -- utilitaires -----------------------------------------------------------

export function ensureAppDbPath() {
  const base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  const dir = path.join(base, "MamaStock", "data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "mamastock.db");
}

export function readSqlFile(p) {
  return fs.readFileSync(p, "utf8");
}

export function stripComments(sql) {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

export function splitStatements(sql) {
  const statements = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let quote = "";
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      current += ch;
      if (ch === quote && sql[i - 1] !== "\\") inString = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      quote = ch;
      current += ch;
      continue;
    }
    const ahead5 = sql.slice(i, i + 5).toUpperCase();
    const ahead3 = sql.slice(i, i + 3).toUpperCase();
    if (ahead5 === "BEGIN") {
      depth++;
    } else if (ahead3 === "END" && depth > 0) {
      const after = sql.slice(i + 3).match(/^\s*(.)/);
      if (after && after[1] === ";") depth--;
    }
    if (ch === ";" && depth === 0) {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

export function columnExists(db, table, col) {
  try {
    const rows = db.pragma(`table_info(${table})`);
    return rows.some((r) => r.name === col);
  } catch {
    return false;
  }
}

export function guardAlterAddColumn(sql, db) {
  const statements = splitStatements(sql);
  const kept = [];
  const re = /^ALTER\s+TABLE\s+[`"']?(\w+)[`"']?\s+ADD\s+COLUMN\s+[`"']?(\w+)[`"']?/i;
  for (const stmt of statements) {
    const m = stmt.match(re);
    if (m) {
      const table = m[1];
      const col = m[2];
      if (columnExists(db, table, col)) {
        continue; // colonne déjà présente
      }
    }
    kept.push(stmt);
  }
  return kept.join(";\n");
}

// -- principal -------------------------------------------------------------

function main() {
  const dbPath = ensureAppDbPath();
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  if (!fs.existsSync(SQL_DIR)) {
    console.error(`missing SQL directory: ${SQL_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SQL_DIR)
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en"));

  for (const file of files) {
    const full = path.join(SQL_DIR, file);
    let sql = readSqlFile(full);
    sql = stripComments(sql);
    sql = guardAlterAddColumn(sql, db);
    const statements = splitStatements(sql);

    if (statements.length === 0) {
      console.log(`skipped ${file}`);
      continue;
    }

    db.exec("BEGIN");
    for (const stmt of statements) {
      try {
        db.exec(stmt);
      } catch (err) {
        db.exec("ROLLBACK");
        console.error(`error in ${file} executing:`);
        console.error(stmt);
        console.error(err);
        process.exit(1);
      }
    }
    db.exec("COMMIT");
    console.log(`applied ${file}`);
  }
}

main();

