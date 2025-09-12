import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAppDataDbPath } from "./paths.js";

const oldPath = path.join(os.homedir(), "MamaStock", "data", "mamastock.db");
const newPath = getAppDataDbPath();

if (fs.existsSync(oldPath) && oldPath !== newPath) {
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  fs.renameSync(oldPath, newPath);
  console.log("moved");
} else {
  console.log("already aligned");
}
