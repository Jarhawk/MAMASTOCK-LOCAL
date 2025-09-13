import { getDb, isTauri } from "@/lib/db/sql";

function b64url(buf: Uint8Array) {
  // base64url sans padding
  let s = btoa(String.fromCharCode(...buf));
  return s.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
}
function makeSalt(len=16) {
  const u8 = new Uint8Array(len);
  crypto.getRandomValues(u8);
  return b64url(u8);
}

export type LocalUser = { id: number; email: string; mama_id: string };

async function ensureTables() {
  const db = await getDb();
  // Crée la table utilisateurs si absente (compat 001_schema.sql)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      mot_de_passe_hash TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      actif INTEGER NOT NULL DEFAULT 1
    );
  `);
}

function packHash(hashHex: string, salt: string) {
  // format : sha256:<salt>:<hex>
  return `sha256:${salt}:${hashHex}`;
}
function unpackHash(stored: string) {
  // supporte aussi bcrypt si un jour présent ($2a$...) -> non géré ici
  if (stored.startsWith("sha256:")) {
    const [, salt, hex] = stored.split(":");
    return { algo: "sha256" as const, salt, hex };
  }
  return null;
}

export async function registerLocal(email: string, password: string): Promise<LocalUser> {
  if (!isTauri) throw new Error("Tauri required");
  email = email.trim().toLowerCase();
  await ensureTables();
  const db = await getDb();
  const exists = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM utilisateurs WHERE email = ?", [email]);
  if (exists[0]?.count) throw new Error("Email déjà utilisé.");

  const salt = makeSalt();
  const hex  = await sha256Hex(`${password}:${salt}`);
  const stored = packHash(hex, salt);

  await db.execute("INSERT INTO utilisateurs (email, mot_de_passe_hash, role, actif) VALUES (?, ?, 'admin', 1)", [email, stored]);

  // retourne profil minimal attendu par useAuth()
  return { id: (await db.select<{ id:number }[]>("SELECT last_insert_rowid() as id"))[0].id, email, mama_id: "local" };
}

export async function loginLocal(email: string, password: string): Promise<LocalUser> {
  if (!isTauri) throw new Error("Tauri required");
  email = email.trim().toLowerCase();
  await ensureTables();
  const db = await getDb();
  const rows = await db.select<{ id:number; email:string; mot_de_passe_hash:string }[]>(
    "SELECT id, email, mot_de_passe_hash FROM utilisateurs WHERE email=? AND actif=1 LIMIT 1",
    [email]
  );
  if (!rows.length) throw new Error("Utilisateur introuvable.");
  const u = rows[0];
  const meta = unpackHash(u.mot_de_passe_hash);
  if (!meta) throw new Error("Format de mot de passe non supporté.");

  const checkHex = await sha256Hex(`${password}:${meta.salt}`);
  if (checkHex !== meta.hex) throw new Error("Mot de passe invalide.");

  return { id: u.id, email: u.email, mama_id: "local" };
}
