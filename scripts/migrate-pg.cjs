const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const dbUrl = process.env.PGURL || process.env.DATABASE_URL || process.env.VITE_DB_URL;
if (!dbUrl || !dbUrl.startsWith('postgres')) {
  console.error('Veuillez définir PGURL=postgresql://…');
  process.exit(1);
}

const dir = path.resolve(__dirname, '../src-tauri/migrations/pg');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
const baseArgs = ['-X', '-q', '-v', 'ON_ERROR_STOP=1'];

try {
  for (const f of files) {
    const full = path.join(dir, f);
    console.log('> APPLY', f);
    const args = [dbUrl, ...baseArgs, '-f', full];
    execFileSync('psql', args, { stdio: 'inherit' });
  }

  const verificationQuery = `
SELECT 'views' AS kind, COUNT(*) AS n FROM pg_views WHERE schemaname='public'
UNION ALL
SELECT 'funcs' AS kind, COUNT(*) AS n FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public'
UNION ALL
SELECT 'triggers' AS kind, COUNT(*) AS n FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid WHERE NOT t.tgisinternal AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname='public');
  `.trim();

  console.log('> CHECK');
  execFileSync('psql', [dbUrl, ...baseArgs, '-t', '-A', '-c', verificationQuery], { stdio: 'inherit' });

  console.log('Migrations PG OK');
} catch (error) {
  console.error('Migrations PG FAILED');
  if (typeof error?.status === 'number' && error.status !== 0) {
    process.exit(error.status);
  }
  process.exit(1);
}
