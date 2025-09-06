import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { createDir, readTextFile, writeTextFile, exists } from "@tauri-apps/api/fs";

let dbPromise: Promise<Database> | null = null;

async function configPath(): Promise<string> {
  const base = await appDataDir();
  const dir = await join(base, "MamaStock");
  await createDir(dir, { recursive: true });
  return await join(dir, "config.json");
}

export async function getDataDir(): Promise<string> {
  const cfg = await configPath();
  if (await exists(cfg)) {
    try {
      const data = JSON.parse(await readTextFile(cfg));
      if (data.dataDir) return data.dataDir as string;
    } catch (_) {
      /* ignore */
    }
  }
  const base = await appDataDir();
  return await join(base, "MamaStock", "data");
}

export async function setDataDir(dir: string) {
  const cfg = await configPath();
  await writeTextFile(cfg, JSON.stringify({ dataDir: dir }));
  dbPromise = null; // force reload
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const dir = await getDataDir();
      await createDir(dir, { recursive: true });
      const dbPath = await join(dir, "mamastock.db");
      const isNew = !(await exists(dbPath));
      const db = await Database.load(`sqlite:${dbPath}`);
      if (isNew) {
        try {
          const sql = await fetch("/migrations/001_init.sql").then((r) => r.text());
          await db.execute(sql);
        } catch (e) {
          console.error("Migration 001 failed", e);
        }
      }
      return db;
    })();
  }
  return dbPromise;
}

export async function produits_list() {
  const db = await getDb();
  return db.select("SELECT * FROM produits");
}

export async function produits_create(p: { id: string; fournisseur_id?: string; nom: string }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO produits (id, fournisseur_id, nom) VALUES (?, ?, ?)",
    [p.id, p.fournisseur_id, p.nom]
  );
}

export async function produits_update(
  id: string,
  fields: { fournisseur_id?: string; nom?: string }
) {
  const db = await getDb();
  const sets: string[] = [];
  const values: any[] = [];
  if (fields.fournisseur_id !== undefined) {
    sets.push("fournisseur_id = ?");
    values.push(fields.fournisseur_id);
  }
  if (fields.nom !== undefined) {
    sets.push("nom = ?");
    values.push(fields.nom);
  }
  values.push(id);
  await db.execute(`UPDATE produits SET ${sets.join(",")} WHERE id = ?`, values);
}

export async function fournisseurs_list() {
  const db = await getDb();
  return db.select("SELECT * FROM fournisseurs");
}

export async function fournisseurs_create(f: { id: string; nom: string }) {
  const db = await getDb();
  await db.execute("INSERT INTO fournisseurs (id, nom) VALUES (?, ?)", [f.id, f.nom]);
}

export async function facture_create_with_lignes(
  facture: { id: string; fournisseur_id: string; total: number; date: string },
  lignes: Array<{ id: string; produit_id: string; quantite: number; prix: number }>
) {
  const db = await getDb();
  await db.execute("BEGIN");
  try {
    await db.execute(
      "INSERT INTO factures (id, fournisseur_id, total, date) VALUES (?,?,?,?)",
      [facture.id, facture.fournisseur_id, facture.total, facture.date]
    );
    for (const l of lignes) {
      await db.execute(
        "INSERT INTO facture_lignes (id, facture_id, produit_id, quantite, prix) VALUES (?,?,?,?,?)",
        [l.id, facture.id, l.produit_id, l.quantite, l.prix]
      );
    }
    await db.execute("COMMIT");
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }
}
