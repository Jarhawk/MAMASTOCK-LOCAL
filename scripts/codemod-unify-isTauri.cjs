#!/usr/bin/env node
try {
  require.resolve("tsx");
} catch {
  console.error(
    "Missing dependency 'tsx'. Install it with: npm i -D tsx @babel/parser @babel/traverse @babel/generator glob",
  );
  process.exit(1);
}
const { spawnSync } = require("child_process");
const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/codemod-unify-isTauri.ts"],
  { stdio: "inherit" }
);
process.exit(result.status ?? 1);
