import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const plugins = Object.entries(pkg.dependencies).filter(([name]) => name.startsWith('@tauri-apps/plugin-'));
const ok = plugins.length > 0 && plugins.every(([name, version]) => version.startsWith('^2') || version.startsWith('2') || version.startsWith('file:'));
if (ok) {
  process.exit(0);
} else {
  console.error('Plugins not v2');
  process.exit(1);
}
