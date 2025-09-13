import fs from "fs/promises";
import fssync from "fs";
import path from "path";

const ROOT = process.cwd();
const capDir = path.join(ROOT, "src-tauri", "capabilities");

function looksSuspicious(name) {
  return /\.(bak|disabled)(\.|$)/i.test(name);
}
function hasMergeMarkers(text) {
  return /<{7}|={7}|>{7}/.test(text);
}

async function main() {
  try {
    const entries = await fs.readdir(capDir, { withFileTypes: true });
    let ok = true;

    for (const e of entries) {
      const p = path.join(capDir, e.name);
      if (!e.isFile()) continue;

      if (path.extname(e.name) !== ".json") {
        console.warn("⚠️  Non-JSON file in capabilities:", e.name);
        continue;
      }
      const raw = await fs.readFile(p, "utf8");
      if (looksSuspicious(e.name)) {
        console.warn("⚠️  Suspicious filename:", e.name);
      }
      if (hasMergeMarkers(raw)) {
        console.error("❌ Merge markers found in:", e.name);
        ok = false;
      }
      try {
        JSON.parse(raw);
        console.log("✅ JSON OK:", e.name);
      } catch (err) {
        console.error("❌ JSON invalid:", e.name, "-", err.message);
        ok = false;
      }
    }

    if (!ok) {
      console.log("\n❗Corrige les erreurs ci-dessus puis relance la build Tauri.");
      process.exit(2);
    } else {
      console.log("\nAll capabilities look good.");
    }
  } catch (e) {
    console.error("check-capabilities failed:", e.message);
    process.exit(1);
  }
}
main();

