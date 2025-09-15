import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const os = require("os");
const path = require("path");

const APP_ID = "com.mamastock.local";

export function appDataBaseDir() {
  if (process.platform === "win32") {
    const base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(base, APP_ID, "MamaStock");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_ID, "MamaStock");
  }
  return path.join(os.homedir(), ".local", "share", APP_ID, "MamaStock");
}

export function dbDir() {
  return path.join(appDataBaseDir(), "data");
}

export function dbFile() {
  return path.join(dbDir(), "mamastock.db");
}

export default { appDataBaseDir, dbDir, dbFile };
