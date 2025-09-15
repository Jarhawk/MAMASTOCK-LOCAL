// src/auth/sqliteAuth.ts
import { getDb, isTauri } from "@/lib/db/sql";
import bcrypt from "bcryptjs";

export type DbUser = {
  id: string;
  email: string;
  mama_id: string;
  mot_de_passe_hash: string;
  salt: string | null;
  created_at: string;
};

export async function loginSqlite(email: string, password: string) {
  email = email.trim().toLowerCase();
  const db = await getDb();
  const rows = await db.select<DbUser[]>(
    "SELECT id,email,mama_id,mot_de_passe_hash,salt,created_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const u = rows?.[0];
  if (!u) throw new Error("Utilisateur introuvable.");

  if (!u.mot_de_passe_hash) {
    throw new Error("Compte non initialisé (mot de passe manquant).");
  }
  const ok = await bcrypt.compare(password, u.mot_de_passe_hash);
  if (!ok) throw new Error("Mot de passe invalide.");

  return { id: u.id, email: u.email, mama_id: u.mama_id };
}

export async function registerSqlite(email: string, password: string) {
  email = email.trim().toLowerCase();
  const db = await getDb();
  const exists = await db.select<{cnt: number;}[]>(
    "SELECT COUNT(*) as cnt FROM users WHERE email = ?",
    [email]
  );
  if ((exists?.[0]?.cnt ?? 0) > 0) throw new Error("Email déjà utilisé.");

  const hash = await bcrypt.hash(password, 10);
  const mama_id = "local-" + Math.random().toString(36).slice(2, 8);
  const id = crypto.randomUUID();

  await db.execute(
    "INSERT INTO users(id,email,mama_id,mot_de_passe_hash,salt,created_at) VALUES(?,?,?,?,?,datetime('now'))",
    [id, email, mama_id, hash, ""]
  );

  return { id, email, mama_id };
}