// scripts/seed-admin.js
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

/** Renvoie le dossier AppData conforme à Tauri appDataDir:
 *  - Windows: %APPDATA% (ex: C:\Users\...\AppData\Roaming)
 *  - macOS:   ~/Library/Application Support
 *  - Linux:   ~/.config
 */
function appDataBase() {
  const p = os.platform();
  if (p === "win32") return process.env.APPDATA;
  if (p === "darwin") return path.join(process.env.HOME ?? os.homedir(), "Library", "Application Support");
  return path.join(process.env.HOME ?? os.homedir(), ".config");
}

// Même hiérarchie que appDataDir() côté Tauri:
const base = appDataBase();
if (!base) {
  console.error("APPDATA/HOME introuvable. Abandon.");
  process.exit(1);
}
const appRoot = path.join(base, "com.mamastock.local", "MamaStock");
const usersFile = path.join(appRoot, "users.json");

fs.mkdirSync(appRoot, { recursive: true });

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function randomId() {
  return crypto.randomUUID();
}
function randomMamaId() {
  return "local-" + Math.random().toString(36).slice(2, 8);
}

const adminEmail = "admin@mamastock.local";
const adminPassword = "Admin123!";

let users = [];
if (fs.existsSync(usersFile)) {
  try { users = JSON.parse(fs.readFileSync(usersFile, "utf8")); }
  catch { users = []; }
}

let user = users.find(u => u.email === adminEmail);
const salt = crypto.randomUUID();
const hash = sha256Hex(`${adminPassword}:${salt}`);

if (!user) {
  user = {
    id: randomId(),
    email: adminEmail,
    mama_id: randomMamaId(),
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  console.info("✔ Admin créé:", adminEmail);
} else {
  // met à jour le mot de passe si l’admin existe déjà
  user.salt = salt;
  user.passwordHash = hash;
  console.info("✔ Admin mis à jour:", adminEmail);
}

fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
console.info("OK users.json ->", usersFile);
