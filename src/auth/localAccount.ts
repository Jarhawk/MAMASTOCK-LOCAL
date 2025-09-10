import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { inAppDir } from "@/lib/paths";

export type LocalUser = {
  id: string;
  email: string;
  mama_id: string;
  password_hash: string;
  salt: string;
};

async function usersFile() {
  return inAppDir("users.json");
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readUsers(): Promise<LocalUser[]> {
  const file = await usersFile();
  if (!(await exists(file))) return [];
  try {
    const txt = await readTextFile(file);
    return JSON.parse(txt) as LocalUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: LocalUser[]) {
  const file = await usersFile();
  await writeTextFile(file, JSON.stringify(users, null, 2));
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
  const password_hash = await sha256Hex(`${password}:${salt}`);
  users.push({ id, email, mama_id, password_hash, salt });
  await writeUsers(users);
  return { id, email, mama_id };
}

export async function loginLocal(email: string, password: string) {
  email = email.trim().toLowerCase();
  const users = await readUsers();
  const u = users.find((x) => x.email === email);
  if (!u) throw new Error("Utilisateur introuvable.");
  const check = await sha256Hex(`${password}:${u.salt}`);
  if (check !== u.password_hash) throw new Error("Mot de passe invalide.");
  return { id: u.id, email: u.email, mama_id: u.mama_id };
}

