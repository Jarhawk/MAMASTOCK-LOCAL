import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const tauriConfPath = path.join(ROOT, "src-tauri", "tauri.conf.json");
const sqlCapPath = path.join(ROOT, "src-tauri", "capabilities", "sql.json");

async function main() {
  let label = "main";

  try {
    const confRaw = await fs.readFile(tauriConfPath, "utf8");
    const conf = JSON.parse(confRaw);
    const first = conf?.app?.windows?.[0];
    if (first && typeof first.label === "string" && first.label) {
      label = first.label;
    }
  } catch (err) {
    console.warn("⚠️  Unable to read tauri.conf.json:", err.message);
    console.warn('    Falling back to label "main".');
  }

  const sqlRaw = await fs.readFile(sqlCapPath, "utf8");
  const sql = JSON.parse(sqlRaw);
  if (!Array.isArray(sql.windows)) sql.windows = [];

  const before = new Set(sql.windows);
  const had = before.has(label);
  if (!had) sql.windows.push(label);

  await fs.writeFile(sqlCapPath, JSON.stringify(sql, null, 2) + "\n", "utf8");

  console.log("Tauri first window label:", label);
  if (had) {
    console.log(`'${label}' already present in sql.json windows.`);
  } else {
    console.log(`Added '${label}' to sql.json windows.`);
  }
  console.log("Current windows:", sql.windows.join(", "));
  console.log("Updated", path.relative(ROOT, sqlCapPath));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
