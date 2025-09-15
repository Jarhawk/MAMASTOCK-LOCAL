import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'capcheck-'));
  const htmlPath = join(dir, 'index.html');
  const html = `<!doctype html>
<html><body><script type="module">
import { Database } from '@tauri-apps/plugin-sql';
(async () => {
  let ok = true;
  let db;
  try {
    db = await Database.load('sqlite:capcheck.db');
  } catch (e) {
    if (String(e).includes('not allowed')) {
      console.log('CAPCHECK:missing:sql:allow-load');
    } else {
      console.log('CAPCHECK:error:' + e);
    }
    ok = false;
  }
  if (db) {
    try {
      await db.select('SELECT 1');
    } catch (e) {
      if (String(e).includes('not allowed')) {
        console.log('CAPCHECK:missing:sql:allow-select');
      } else {
        console.log('CAPCHECK:error:' + e);
      }
      ok = false;
    }
    try {
      await db.execute('CREATE TABLE IF NOT EXISTS _capcheck(value INTEGER);');
      await db.execute('INSERT INTO _capcheck(value) VALUES (1);');
    } catch (e) {
      if (String(e).includes('not allowed')) {
        console.log('CAPCHECK:missing:sql:allow-execute');
      } else {
        console.log('CAPCHECK:error:' + e);
      }
      ok = false;
    }
  }
  console.log('CAPCHECK:DONE:' + (ok ? 'ok' : 'fail'));
})();
</script></body></html>`;
  await writeFile(htmlPath, html, 'utf8');

  const env = { ...process.env, TAURI_DEV_URL: `file://${htmlPath}` };
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(cmd, ['tauri', 'dev'], { env });

  const missing: string[] = [];
  let resolved = false;

  function handle(line: string) {
    const idx = line.indexOf('CAPCHECK:');
    if (idx === -1) return;
    const msg = line.slice(idx + 9);
    if (msg.startsWith('missing:')) {
      const perm = msg.slice(8);
      if (!missing.includes(perm)) {
        missing.push(perm);
        console.log(`Missing permission: ${perm}`);
      }
    } else if (msg.startsWith('DONE:') && !resolved) {
      resolved = true;
      const ok = msg.slice(5) === 'ok';
      child.kill();
      if (missing.length === 0 && ok) {
        console.log('All SQL permissions present.');
        process.exit(0);
      } else {
        if (missing.length === 0) console.log('SQL capability check failed.');
        process.exit(1);
      }
    }
  }

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => d.split(/\r?\n/).forEach(handle));
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (d) => d.split(/\r?\n/).forEach(handle));
  child.on('exit', (code) => {
    if (!resolved) {
      console.error('Tauri process exited early with', code);
      process.exit(code ?? 1);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
