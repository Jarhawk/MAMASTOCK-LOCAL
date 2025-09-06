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

async function ensureSchema(db: Database) {
  const rows = await db.select(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='meta'"
  );
  if (rows.length === 0) {
    const sql = await readTextFile("migrations/001_schema.sql");
    await db.execute(sql);
  }
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const dir = await getDataDir();
    await createDir(dir, { recursive: true });
    const dbPath = await join(dir, "mamastock.db");
    dbPromise = Database.load(`sqlite:${dbPath}`);
    await ensureSchema(await dbPromise);
  }
  return dbPromise;
}

export async function produits_list(search?: string, actif?: number) {
  const db = await getDb();
  let sql = "SELECT * FROM produits";
  const clauses: string[] = [];
  const params: any[] = [];
  if (search) {
    clauses.push("nom LIKE ?");
    params.push(`%${search}%`);
  }
  if (actif !== undefined) {
    clauses.push("actif = ?");
    params.push(actif);
  }
  if (clauses.length) sql += " WHERE " + clauses.join(" AND ");
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

export async function produits_create(p: {
  nom: string;
  unite?: string;
  famille?: string;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO produits (nom, unite, famille) VALUES (?,?,?)",
    [p.nom, p.unite ?? null, p.famille ?? null]
  );
}

export async function produits_update(
  id: number,
  patch: { nom?: string; unite?: string; famille?: string; actif?: number }
) {
  const db = await getDb();
  const sets: string[] = [];
  const values: any[] = [];
  if (patch.nom !== undefined) {
    sets.push("nom = ?");
    values.push(patch.nom);
  }
  if (patch.unite !== undefined) {
    sets.push("unite = ?");
    values.push(patch.unite);
  }
  if (patch.famille !== undefined) {
    sets.push("famille = ?");
    values.push(patch.famille);
  }
  if (patch.actif !== undefined) {
    sets.push("actif = ?");
    values.push(patch.actif);
  }
  if (!sets.length) return;
  values.push(id);
  await db.execute(`UPDATE produits SET ${sets.join(",")} WHERE id = ?`, values);
}

export async function fournisseurs_list(search?: string) {
  const db = await getDb();
  let sql = "SELECT * FROM fournisseurs";
  const params: any[] = [];
  if (search) {
    sql += " WHERE nom LIKE ?";
    params.push(`%${search}%`);
  }
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

export async function fournisseurs_create(f: { nom: string; email?: string }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO fournisseurs (nom, email) VALUES (?, ?)",
    [f.nom, f.email ?? null]
  );
}

export async function facture_create_with_lignes(data: {
  fournisseur_id: number;
  date_iso?: string;
  lignes: Array<{ produit_id: number; quantite: number; prix_unitaire: number }>;
}) {
  const db = await getDb();
  await db.execute("BEGIN");
  try {
    const date = data.date_iso ?? new Date().toISOString().slice(0, 10);
    await db.execute(
      "INSERT INTO factures (fournisseur_id, date_iso) VALUES (?, ?)",
      [data.fournisseur_id, date]
    );
    const [{ id: factureId }] = await db.select(
      "SELECT last_insert_rowid() as id"
    );
    for (const l of data.lignes) {
      await db.execute(
        "INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (?,?,?,?)",
        [factureId, l.produit_id, l.quantite, l.prix_unitaire]
      );
    }
    await db.execute("COMMIT");
    return factureId;
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }
}
