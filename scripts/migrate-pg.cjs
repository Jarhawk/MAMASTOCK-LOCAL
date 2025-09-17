const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const dbUrl = process.env.PGURL || process.env.DATABASE_URL || process.env.VITE_DB_URL;
if (!dbUrl || !dbUrl.startsWith('postgres')) {
  console.error('Veuillez définir PGURL=postgresql://…');
  process.exit(1);
}

const dir = path.resolve(__dirname, '../src-tauri/migrations/pg');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
for (const f of files) {
  const full = path.join(dir, f);
  console.log('> APPLY', f);
  execSync(`psql "${dbUrl}" -v ON_ERROR_STOP=1 -f "${full}"`, { stdio: 'inherit' });
}
console.log('Migrations PG OK');
