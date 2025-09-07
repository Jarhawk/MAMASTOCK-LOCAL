import { spawnSync } from 'node:child_process';

const baseArgs = [
  '--color=never',
  '-n',
  '-g',
  '!*node_modules/*',
  '-g',
  '!*plugins/*',
  '-g',
  '!scripts/check-tauri-imports.js',
  '-g',
  '!*docs/reports/*',
];

const whitelist = [
  '@tauri-apps/api/path',
  '@tauri-apps/api/window',
];

let failed = false;

const dialogApiRes = spawnSync('rg', [...baseArgs, '@tauri-apps/api/dialog']);
const dialogApiOut = dialogApiRes.stdout.toString().trim();
if (dialogApiOut) {
  console.error(
    `Forbidden import detected for module "@tauri-apps/api/dialog":\n${dialogApiOut}`
  );
  failed = true;
}

const apiRes = spawnSync('rg', [...baseArgs, '@tauri-apps/api/']);
const apiOut = apiRes.stdout.toString().trim();
if (apiOut) {
  const lines = apiOut
    .split('\n')
    .filter((line) => !whitelist.some((w) => line.includes(w)));
  if (lines.length) {
    console.error(
      `Forbidden import detected for pattern "@tauri-apps/api/":\n${lines.join('\n')}`
    );
    failed = true;
  }
}

const pluginRes = spawnSync('rg', [...baseArgs, "@tauri-apps/[^\"']+\\.js"]);
const pluginOut = pluginRes.stdout.toString().trim();
if (pluginOut) {
  console.error(
    `Forbidden import detected for pattern "@tauri-apps/[^"\\']+\\.js":\n${pluginOut}`
  );
  failed = true;
}

if (failed) {
  process.exit(1);
}

