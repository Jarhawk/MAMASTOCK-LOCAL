import { spawnSync } from 'node:child_process';

const modules = ['fs', 'path', 'crypto'];
const ignore = ['-g', '!src/lib/patchRemoteBackend.ts'];
let failed = false;

for (const mod of modules) {
  const importPattern = `from ['\"](?:node:)?${mod}['\"]`;
  const importRes = spawnSync('rg', ['--color=never', '-n', ...ignore, importPattern, 'src']);
  const importOut = importRes.stdout.toString().trim();
  if (importOut) {
    console.error(`Forbidden import detected for module "${mod}":\n${importOut}`);
    failed = true;
  }
  const requirePattern = `require\\(['\"](?:node:)?${mod}['\"]\\)`;
  const requireRes = spawnSync('rg', ['--color=never', '-n', ...ignore, requirePattern, 'src']);
  const requireOut = requireRes.stdout.toString().trim();
  if (requireOut) {
    console.error(`Forbidden import detected for module "${mod}":\n${requireOut}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
