import os from "node:os";
import path from "node:path";
export function getAppDataDbPath() {
  const home = os.homedir();
  // même logique que dans src/db/connection.ts (AppData/Roaming sur Windows)
  const base = process.env.APPDATA
    || (process.platform === "darwin"
        ? path.join(home, "Library", "Application Support")
        : path.join(home, ".config"));
  return path.join(base, "com.mamastock.local", "MamaStock", "data", "mamastock.db");
}
