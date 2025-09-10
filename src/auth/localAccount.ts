import {
  exists,
  mkdir,
  readTextFile,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

export type LocalUser = {
  id: string;
  email: string;
  mama_id: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};
async function tauriBaseDir(): Promise<string> {
  return appDataDir();
}

async function legacyUsersPath(): Promise<string> {
  const base = await tauriBaseDir();
  return join(base, "..", "MamaStock", "users.json");
}

async function currentUsersPath(): Promise<string> {
  const base = await tauriBaseDir();
  return join(base, "MamaStock", "users.json");
}

async function ensureCurrentDir(): Promise<void> {
  const base = await tauriBaseDir();
  const dir = await join(base, "MamaStock");
  await mkdir(dir, { recursive: true });
}

async function migrateLegacyFile(): Promise<void> {
  const legacy = await legacyUsersPath();
  const current = await currentUsersPath();
  if (await exists(legacy)) {
    if (!(await exists(current))) {
      await ensureCurrentDir();
      await rename(legacy, current);
      try {
        const txt = await readTextFile(current);
        const arr = JSON.parse(txt) as any[];
        const normalized = arr.map((u) => {
          if (u.password_hash && !u.passwordHash) {
            u.passwordHash = u.password_hash;
          }
          delete u.password_hash;
          if (!u.createdAt) {
            u.createdAt = new Date().toISOString();
          }
          return u;
        });
        await writeTextFile(current, JSON.stringify(normalized, null, 2));
      } catch {
        // ignore parse errors
      }
    }
  }
}

async function usersPath() {
  if (typeof window === "undefined" || !(window as any).__TAURI__) {
    throw new Error("Utilisation hors de Tauri.");
  }
  await migrateLegacyFile();
  return currentUsersPath();
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readUsers(): Promise<LocalUser[]> {
  const file = await usersPath();
  if (!(await exists(file))) return [];
  try {
    const txt = await readTextFile(file);
    const arr = JSON.parse(txt) as any[];
    return arr.map((u: any) => {
      const passwordHash = u.passwordHash ?? u.password_hash;
      const createdAt = u.createdAt ?? new Date().toISOString();
      return {
        id: u.id,
        email: u.email,
        mama_id: u.mama_id,
        passwordHash,
        salt: u.salt,
        createdAt,
      } as LocalUser;
    });
  } catch {
    return [];
  }
}

async function writeUsers(users: LocalUser[]) {
  const file = await usersPath();
  await ensureCurrentDir();
  const normalized = users.map((u) => ({
    id: u.id,
    email: u.email,
    mama_id: u.mama_id,
    passwordHash: u.passwordHash,
    salt: u.salt,
    createdAt: u.createdAt,
  }));
  await writeTextFile(file, JSON.stringify(normalized, null, 2));
}

export async function registerLocal(email: string, password: string) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("Email déjà utilisé.");
  }
  const id = crypto.randomUUID();
  const mama_id = "local-" + Math.random().toString(36).slice(2, 8);
  const salt = crypto.randomUUID();
  const passwordHash = await sha256Hex(`${password}:${salt}`);
  const createdAt = new Date().toISOString();
  users.push({ id, email, mama_id, passwordHash, salt, createdAt });
  await writeUsers(users);
  return { id, email, mama_id };
}

export async function loginLocal(email: string, password: string) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  const u = users.find((x) => x.email === email);
  if (!u) throw new Error("Utilisateur introuvable.");
  const stored = u.passwordHash ?? (u as any).password_hash ?? null;
  if (stored === null) throw new Error("Utilisateur corrompu.");
  const check = await sha256Hex(`${password}:${u.salt}`);
  if (check !== stored) {
    const fallback = await sha256Hex(password);
    if (fallback !== stored) {
      throw new Error("Mot de passe invalide.");
    }
  }
  return { id: u.id, email: u.email, mama_id: u.mama_id };
}

