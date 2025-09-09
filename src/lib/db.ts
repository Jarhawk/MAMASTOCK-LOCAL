import Database from "@tauri-apps/plugin-sql";
import {
  mkdir as createDir,
  readTextFile,
  writeTextFile,
  exists,
  readFile,
  writeFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

const APP_DIR = "MamaStock";
const DATA_DIR = `${APP_DIR}/data`;
const EXPORT_DIR = `${APP_DIR}/Exports`;
const BACKUP_DIR = `${APP_DIR}/Backups`;
const CONFIG_FILE = `${APP_DIR}/config.json`;

let dbPromise: Promise<Database> | null = null;

async function ensureAppDir() {
  await createDir(APP_DIR, { dir: BaseDirectory.AppData, recursive: true });
}

async function readConfig(): Promise<any> {
  await ensureAppDir();
  if (await exists(CONFIG_FILE, { dir: BaseDirectory.AppData })) {
    try {
      return JSON.parse(await readTextFile(CONFIG_FILE, { dir: BaseDirectory.AppData }));
    } catch (_) {
      /* ignore */
    }
  }
  return {};
}

async function writeConfig(data: any) {
  await ensureAppDir();
  await writeTextFile(CONFIG_FILE, JSON.stringify(data), { dir: BaseDirectory.AppData });
}

export async function getDataDir(): Promise<string> {
  const cfg = await readConfig();
  return cfg.dataDir || DATA_DIR;
}

export async function setDataDir(dir: string) {
  const cfg = await readConfig();
  await writeConfig({ ...cfg, dataDir: dir });
  dbPromise = null; // force reload
}

export async function getExportDir(): Promise<string> {
  const cfg = await readConfig();
  return cfg.exportDir || EXPORT_DIR;
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
  const source = `${dataDir}/mamastock.db`;
  await createDir(BACKUP_DIR, { dir: BaseDirectory.AppData, recursive: true });
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const dest = `${BACKUP_DIR}/mamastock_${stamp}.db`;
  const data = await readFile(source, { dir: BaseDirectory.AppData });
  await writeFile(dest, data, { dir: BaseDirectory.AppData });
  return dest;
}

export async function restoreDb(file: string) {
  await closeDb();
  const dataDir = await getDataDir();
  const dest = `${dataDir}/mamastock.db`;
  const data = await readFile(file, { dir: BaseDirectory.AppData });
  await writeFile(dest, data, { dir: BaseDirectory.AppData });
}

export async function maintenanceDb() {
  const db = await getDb();
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  await db.execute("VACUUM");
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const dir = await getDataDir();
    await createDir(dir, { dir: BaseDirectory.AppData, recursive: true });
    const dbPath = `${dir}/mamastock.db`;
    const existsDb = await exists(dbPath, { dir: BaseDirectory.AppData });
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
  actif: boolean | null = true,
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
  if (actif !== null) {
    where.push("actif = ?");
    params.push(actif ? 1 : 0);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.select(
    `SELECT id, nom, unite, famille, actif, pmp, stock_theorique, valeur_stock FROM produits ${whereClause} ORDER BY nom LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const totalRes = await db.select(
    `SELECT COUNT(*) as count FROM produits ${whereClause}`,
    params
  );
  const total = Number(totalRes[0]?.count ?? 0);
  return { rows, total };
}

export async function produit_get(id: number) {
  const db = await getDb();
  const rows = await db.select(
    `SELECT id, nom, unite, famille, actif, pmp, stock_theorique, valeur_stock FROM produits WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function produits_create(p: { nom: string; unite?: string | null; famille?: string | null; actif?: boolean }) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO produits (nom, unite, famille, actif) VALUES (?,?,?,?)`,
    [p.nom, p.unite ?? null, p.famille ?? null, p.actif === false ? 0 : 1]
  );
}

export async function produits_update(
  id: number,
  fields: { nom?: string; unite?: string | null; famille?: string | null; actif?: boolean }
) {
  const db = await getDb();
  const sets: string[] = [];
  const values: any[] = [];
  if (fields.nom !== undefined) {
    sets.push("nom = ?");
    values.push(fields.nom);
  }
  if (fields.unite !== undefined) {
    sets.push("unite = ?");
    values.push(fields.unite);
  }
  if (fields.famille !== undefined) {
    sets.push("famille = ?");
    values.push(fields.famille);
  }
  if (fields.actif !== undefined) {
    sets.push("actif = ?");
    values.push(fields.actif ? 1 : 0);
  }
  if (!sets.length) return;
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
    `SELECT id, nom, email, actif FROM fournisseurs ${where} ORDER BY nom LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const totalRes = await db.select(
    `SELECT COUNT(*) as count FROM fournisseurs ${where}`,
    params
  );
  const total = Number(totalRes[0]?.count ?? 0);
  return { rows, total };
}

export async function fournisseur_get(id: number) {
  const db = await getDb();
  const rows = await db.select(`SELECT id, nom, email, actif FROM fournisseurs WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function fournisseurs_create(f: { nom: string; email?: string | null; actif?: boolean }) {
  const db = await getDb();
  await db.execute(`INSERT INTO fournisseurs (nom, email, actif) VALUES (?,?,?)`, [
    f.nom,
    f.email ?? null,
    f.actif === false ? 0 : 1,
  ]);
}

export async function factures_by_fournisseur(fournisseur_id: number) {
  const db = await getDb();
  return await db.select(
    `SELECT f.id, f.date_iso, IFNULL(SUM(fl.quantite * fl.prix_unitaire),0) AS montant_total, COUNT(fl.id) AS nb_produits
     FROM factures f
     LEFT JOIN facture_lignes fl ON fl.facture_id = f.id
     WHERE f.fournisseur_id = ?
     GROUP BY f.id, f.date_iso
     ORDER BY f.date_iso DESC`,
    [fournisseur_id]
  );
}

export async function facture_get(id: number) {
  const db = await getDb();
  const factures = await db.select(`SELECT id, fournisseur_id, date_iso FROM factures WHERE id = ? LIMIT 1`, [id]);
  if (!factures.length) return null;
  const lignes = await db.select(
    `SELECT fl.id, fl.produit_id, fl.quantite, fl.prix_unitaire AS prix_unitaire_ht,
            fl.quantite * fl.prix_unitaire AS montant_ht, 0 AS tva, NULL AS zone_id,
            p.nom AS produit_nom, p.unite, p.pmp
       FROM facture_lignes fl
       JOIN produits p ON p.id = fl.produit_id
       WHERE fl.facture_id = ?`,
    [id]
  );
  return { ...factures[0], lignes };
}

export async function facture_create_with_lignes(
  facture: { fournisseur_id: number; date: string },
  lignes: Array<{ produit_id: number; quantite: number; prix: number }>
) {
  const db = await getDb();
  await db.execute("BEGIN");
  try {
    await db.execute(
      `INSERT INTO factures (fournisseur_id, date_iso) VALUES (?, ?)`,
      [facture.fournisseur_id, facture.date]
    );
    const res = await db.select("SELECT last_insert_rowid() as id");
    const factureId = Number(res[0].id);
    for (const l of lignes) {
      await db.execute(
        `INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (?,?,?,?)`,
        [factureId, l.produit_id, l.quantite, l.prix]
      );
    }
    await db.execute("COMMIT");
    return factureId;
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }
}

export async function factures_list(start?: string, end?: string) {
  const db = await getDb();
  const where: string[] = [];
  const params: any[] = [];
  if (start) {
    where.push("f.date_iso >= ?");
    params.push(start);
  }
  if (end) {
    where.push("f.date_iso <= ?");
    params.push(end);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.select(
    `SELECT f.id AS numero, f.date_iso AS date_facture,
            IFNULL(SUM(fl.quantite * fl.prix_unitaire),0) AS montant
       FROM factures f
       LEFT JOIN facture_lignes fl ON fl.facture_id = f.id
       ${whereClause}
       GROUP BY f.id, f.date_iso
       ORDER BY f.date_iso DESC`,
    params
  );
  const totalRes = await db.select(
    `SELECT COUNT(*) as count FROM factures f ${whereClause}`,
    params
  );
  const total = Number(totalRes[0]?.count ?? 0);
  return { rows, total };
}
