import Database from "@tauri-apps/plugin-sql";
import { appDataDir, documentDir, join } from "@tauri-apps/api/path";
import {
  createDir,
  readTextFile,
  writeTextFile,
  exists,
  readBinaryFile,
  writeBinaryFile,
} from "@tauri-apps/api/fs";

let dbPromise: Promise<Database> | null = null;

async function configPath(): Promise<string> {
  const base = await appDataDir();
  const dir = await join(base, "MamaStock");
  await createDir(dir, { recursive: true });
  return await join(dir, "config.json");
}

async function readConfig(): Promise<any> {
  const cfg = await configPath();
  if (await exists(cfg)) {
    try {
      return JSON.parse(await readTextFile(cfg));
    } catch (_) {
      /* ignore */
    }
  }
  return {};
}

async function writeConfig(data: any) {
  const cfg = await configPath();
  await writeTextFile(cfg, JSON.stringify(data));
}

export async function getDataDir(): Promise<string> {
  const cfg = await readConfig();
  if (cfg.dataDir) return cfg.dataDir as string;
  const base = await appDataDir();
  return await join(base, "MamaStock", "data");
}

export async function setDataDir(dir: string) {
  const cfg = await readConfig();
  await writeConfig({ ...cfg, dataDir: dir });
  dbPromise = null; // force reload
}

export async function getExportDir(): Promise<string> {
  const cfg = await readConfig();
  if (cfg.exportDir) return cfg.exportDir as string;
  const base = await documentDir();
  return await join(base, "MamaStock", "Exports");
}

export async function setExportDir(dir: string) {
  const cfg = await readConfig();
  await writeConfig({ ...cfg, exportDir: dir });
}

export async function closeDb() {
  if (dbPromise) {
    const db = await dbPromise;
    await db.close();
    dbPromise = null;
  }
}

export async function backupDb(): Promise<string> {
  const dataDir = await getDataDir();
  const source = await join(dataDir, "mamastock.db");
  const docs = await documentDir();
  const backupDir = await join(docs, "MamaStock", "Backups");
  await createDir(backupDir, { recursive: true });
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const dest = await join(backupDir, `mamastock_${stamp}.db`);
  const data = await readBinaryFile(source);
  await writeBinaryFile(dest, data);
  return dest;
}

export async function restoreDb(file: string) {
  await closeDb();
  const dataDir = await getDataDir();
  const dest = await join(dataDir, "mamastock.db");
  const data = await readBinaryFile(file);
  await writeBinaryFile(dest, data);
}

export async function maintenanceDb() {
  const db = await getDb();
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  await db.execute("VACUUM");
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const dir = await getDataDir();
    await createDir(dir, { recursive: true });
    const dbPath = await join(dir, "mamastock.db");
    const existsDb = await exists(dbPath);
    const db = await Database.load(`sqlite:${dbPath}`);
    dbPromise = Promise.resolve(db);
    if (!existsDb) {
      const res = await fetch("/migrations/001_schema.sql");
      const sql = await res.text();
      const statements = sql
        .split(/;\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        await db.execute(stmt);
      }
      try {
        const seedRes = await fetch("/migrations/002_seed.sql");
        const seed = await seedRes.text();
        const seedStatements = seed
          .split(/;\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const stmt of seedStatements) {
          await db.execute(stmt);
        }
      } catch (_) {
        /* seed optional */
      }
    }
  }
  return dbPromise;
}

export async function produits_list(
  search = "",
  actif = true,
  page = 1,
  pageSize = 20
) {
  const db = await getDb();
  const term = `%${search.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
  const offset = (page - 1) * pageSize;
  const where: string[] = [];
  const params: any[] = [];
  if (search) {
    where.push("nom LIKE ?");
    params.push(term);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.select(
    `SELECT * FROM produits ${whereClause} ORDER BY nom LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const totalRes = await db.select(
    `SELECT COUNT(*) as count FROM produits ${whereClause}`,
    params
  );
  const total = Number(totalRes[0]?.count ?? 0);
  return { rows, total };
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

export async function fournisseurs_list(
  search = "",
  limit = 20,
  page = 1
) {
  const db = await getDb();
  const term = `%${search.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
  const offset = (page - 1) * limit;
  const where = search ? "WHERE nom LIKE ?" : "";
  const params = search ? [term] : [];
  const rows = await db.select(
    `SELECT * FROM fournisseurs ${where} ORDER BY nom LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const totalRes = await db.select(
    `SELECT COUNT(*) as count FROM fournisseurs ${where}`,
    params
  );
  const total = Number(totalRes[0]?.count ?? 0);
  return { rows, total };
}

export async function fournisseur_get(id: string) {
  const db = await getDb();
  const rows = await db.select("SELECT * FROM fournisseurs WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
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
