import { openDb } from "@/db/index";

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerSql(email: string, password: string) {
  email = email.trim().toLowerCase();
  const db = await openDb();
  const exists = await db.select("SELECT 1 as ok FROM users WHERE email = $1", [
    email,
  ]);
  if (exists.length) throw new Error("Email déjà utilisé.");
  const id = crypto.randomUUID();
  const mama_id = "local-" + Math.random().toString(36).slice(2, 8);
  const salt = crypto.randomUUID();
  const password_hash = await sha256Hex(`${password}:${salt}`);
  const created_at = new Date().toISOString();
  await db.execute(
    "INSERT INTO users (id,email,mama_id,password_hash,salt,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
    [id, email, mama_id, password_hash, salt, created_at],
  );
  return { id, email, mama_id };
}

export async function loginSql(email: string, password: string) {
  email = email.trim().toLowerCase();
  const db = await openDb();
  const r = await db.select("SELECT * FROM users WHERE email = $1", [email]);
  if (!r.length) throw new Error("Utilisateur introuvable.");
  const u = r[0] as any;
  const check = await sha256Hex(`${password}:${u.salt}`);
  if (check !== u.password_hash) throw new Error("Mot de passe invalide.");
  return { id: u.id, email: u.email, mama_id: u.mama_id };
}
