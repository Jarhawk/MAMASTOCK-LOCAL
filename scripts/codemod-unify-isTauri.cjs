"use strict";
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const tsFile = path.join(__dirname, "codemod-unify-isTauri.ts");

// Prefer `tsx` runner to avoid ESM loader headaches on Windows
const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["-y", "tsx", tsFile];
const res = spawnSync(cmd, args, { stdio: "inherit" });

if (res.status !== 0) {
  console.error("\nFailed to run codemod with `tsx`.");
  console.error("Try installing dev deps: npm i -D tsx @babel/parser @babel/traverse @babel/generator glob");
  process.exit(res.status || 1);
}
