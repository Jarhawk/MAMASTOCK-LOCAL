import { spawnSync } from 'node:child_process';

const patterns = [
  '@tauri-apps/api/fs',
  '@tauri-apps/api/path',
  '@tauri-apps/api/dialog',
  '@tauri-apps/api/process',
  '@tauri-apps/[^"\']+\.js'
];

let failed = false;

for (const pat of patterns) {
  const args = ['--color=never', '-n', '-g', '!*node_modules/*', '-g', '!*plugins/*', '-g', '!scripts/check-tauri-imports.js', '-g', '!*docs/reports/*', pat];
  const res = spawnSync('rg', args);
  const out = res.stdout.toString().trim();
  if (out) {
    console.error(`Forbidden import detected for pattern "${pat}":\n${out}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
