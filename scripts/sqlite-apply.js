// Applique les migrations SQLite sur un fichier cible
import { readFileSync, writeFileSync, existsSync } from 'fs';
import initSqlJs from 'sql.js';

async function main() {
  const target = process.argv[2] || 'mamastock.db';
  const SQL = await initSqlJs({ locateFile: f => `node_modules/sql.js/dist/${f}` });
  let db;
  if (existsSync(target)) {
    const buf = readFileSync(target);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  const schema = readFileSync('db/sqlite/001_schema.sql', 'utf8');
  db.exec(schema);
  if (existsSync('db/sqlite/002_seed.sql')) {
    const seed = readFileSync('db/sqlite/002_seed.sql', 'utf8');
    db.exec(seed);
  }
  const data = db.export();
  writeFileSync(target, Buffer.from(data));
  console.log(`Base SQLite prête: ${target}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
