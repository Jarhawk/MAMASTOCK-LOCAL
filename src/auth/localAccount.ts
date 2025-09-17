import { appDataDir, join } from "@tauri-apps/api/path";

import { APP_DIR, getAppDir } from "@/lib/paths";
import { isTauri } from "@/lib/tauriEnv";
export const USERS_FILE = "users.json";

// Objet valide (méthode + getter) — évite la syntaxe invalide { isTauri() }
export const LocalAccountEnv = {
  isTauri(): boolean {
    return isTauri();
  },
  get isTauriFlag(): boolean {
    return isTauri();
  },
};

export type LocalUser = {
  id: string;
  email: string;
  mama_id: string;
  role: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

async function usersPath() {
  if (!isTauri()) return "browser://users.json";

  const { exists, rename, readTextFile, writeTextFile } = await import("@tauri-apps/plugin-fs");

  // CODEREVIEW: use centralized AppData helper to persist local accounts safely
  const dir = await getAppDir();
  const target = await join(dir, USERS_FILE);

  // Migration éventuelle d'un ancien emplacement (roaming)
  const base = await appDataDir();
  const roaming = base.replace(/\\com\.mamastock\.local\\?$/i, "");
  const legacy = await join(roaming, APP_DIR, USERS_FILE);
  if (!(await exists(target)) && (await exists(legacy))) {
    await rename(legacy, target);
    try {
      const txt = await readTextFile(target);
      const arr = JSON.parse(txt);
      if (Array.isArray(arr)) {
        const norm = arr.map((u: any) => {
          const out: any = { ...u };
          if (!out.passwordHash && out.password_hash) {
            out.passwordHash = out.password_hash;
            delete out.password_hash;
          }
          if (!out.createdAt) out.createdAt = new Date().toISOString();
          if (!out.role) out.role = "chef_site";
          return out;
        });
        await writeTextFile(target, JSON.stringify(norm, null, 2));
      }
    } catch {
      // ignore migration errors, keep going
    }
  }

  return target;
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readUsers(): Promise<LocalUser[]> {
  const path = await usersPath();
  if (path.startsWith("browser://")) {
    const txt = localStorage.getItem("mama.users.json");
    if (!txt) return [];
    try {
      return JSON.parse(txt) as LocalUser[];
    } catch {
      return [];
    }
  }
  const { exists, readTextFile } = await import("@tauri-apps/plugin-fs");
  if (!(await exists(path))) return [];
  const txt = await readTextFile(path);
  try {
    return JSON.parse(txt) as LocalUser[];
  } catch {
    return [];
  }
}

async function writeUsers(list: LocalUser[]) {
  const path = await usersPath();
  if (path.startsWith("browser://")) {
    localStorage.setItem("mama.users.json", JSON.stringify(list, null, 2));
    return;
  }
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  await writeTextFile(path, JSON.stringify(list, null, 2));
}

export async function listLocalUsers() {
  return await readUsers();
}

export async function registerLocal(
  email: string,
  password: string,
  role: string = "chef_site"
) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  if (users.some((u) => u.email === email)) throw new Error("Email déjà utilisé.");
  const salt = crypto.randomUUID();
  const hash = await sha256Hex(`${password}:${salt}`);
  const user: LocalUser = {
    id: crypto.randomUUID(),
    email,
    mama_id: "local-" + Math.random().toString(36).slice(2, 8),
    role,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function loginLocal(email: string, password: string) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  const u = users.find((x) => x.email === email);
  if (!u) throw new Error("Utilisateur introuvable.");
  const stored = (u as any).passwordHash ?? (u as any).password_hash ?? null;
  if (!stored) throw new Error("Utilisateur corrompu.");
  const check = await sha256Hex(`${password}:${u.salt}`);
  if (check === stored) return u;
  // Dernier recours: anciens seeds non salés
  const legacy = await sha256Hex(password);
  if (legacy === stored) return u;
  throw new Error("Mot de passe invalide.");
}

export async function updatePasswordLocal(email: string, newPassword: string) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  const u = users.find((x) => x.email === email);
  if (!u) throw new Error("Utilisateur introuvable.");
  const salt = crypto.randomUUID();
  const hash = await sha256Hex(`${newPassword}:${salt}`);
  u.salt = salt;
  u.passwordHash = hash;
  await writeUsers(users);
  return u;
}

export async function updateRoleLocal(id: string, role: string) {
  const users = await readUsers();
  const u = users.find((x) => x.id === id);
  if (!u) throw new Error("Utilisateur introuvable.");
  u.role = role;
  await writeUsers(users);
  return u;
}

export async function getUserLocal(id: string) {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function deleteUserLocal(id: string) {
  const users = await readUsers();
  const filtered = users.filter((u) => u.id !== id);
  await writeUsers(filtered);
}
