import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const capDir = path.join(ROOT, "src-tauri", "capabilities");
const sqlPath = path.join(capDir, "sql.json");

const obj = {
  "$schema": "../gen/schemas/plugin-sql.json",
  "identifier": "sql",
  "description": "Permissions for SQL plugin",
  "windows": ["main"],
  "permissions": [
    "sql:default",
    "sql:allow-load",
    "sql:allow-select",
    "sql:allow-execute",
    "sql:allow-close"
  ]
};

async function main() {
  await fs.mkdir(capDir, { recursive: true });
  const json = JSON.stringify(obj, null, 2);
  await fs.writeFile(sqlPath, json, "utf8");

  // relecture + parse pour valider
  const raw = await fs.readFile(sqlPath, "utf8");
  const parsed = JSON.parse(raw);

  console.log("✅ Wrote", path.relative(ROOT, sqlPath));
  console.log("----");
  console.log(JSON.stringify(parsed, null, 2));
  console.log("----");
  console.log("TIP: redémarre Tauri (npx tauri dev) pour recharger les capabilities.");
}

main().catch((e) => { console.error(e); process.exit(1); });
