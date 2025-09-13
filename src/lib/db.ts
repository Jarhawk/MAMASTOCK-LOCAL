import { getDb as baseGetDb, closeDb as baseCloseDb } from "@/lib/db/sql";
import { dataDbPath, inAppDir } from "@/lib/paths";
import { readConfig, writeConfig } from "@/appFs";
import { isTauri } from "@/lib/db/sql";

export async function getDb() {
  return baseGetDb();
}

// Fournisseurs
export async function fournisseurs_list() {
  const db = await getDb();
  return db.select("SELECT id, nom, email, actif FROM fournisseurs ORDER BY nom");
}
export async function fournisseurs_create({ nom, email }: {nom:string; email?:string}) {
  const db = await getDb();
  await db.execute("INSERT INTO fournisseurs(nom,email,actif) VALUES(?,?,1)", [nom, email ?? null]);
}

export async function fournisseur_get(id: string | number) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT id, nom, email, actif FROM fournisseurs WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

export async function factures_by_fournisseur(fournisseurId: string | number) {
  const db = await getDb();
  return db.select(
    `SELECT f.id,
            f.date_iso AS date_facture,
            IFNULL(SUM(l.quantite * l.prix_unitaire), 0) AS montant_total,
            COUNT(DISTINCT l.produit_id) AS nb_produits
     FROM factures f
     LEFT JOIN facture_lignes l ON l.facture_id = f.id
     WHERE f.fournisseur_id = ?
     GROUP BY f.id
     ORDER BY f.date_iso DESC`,
    [fournisseurId]
  );
}

export async function fournisseurs_recents(limit = 10) {
  const db = await getDb();
  return db.select(
    `SELECT f.id, f.nom, f.ville
     FROM fournisseurs f
     LEFT JOIN factures fa ON fa.fournisseur_id = f.id
     GROUP BY f.id
     ORDER BY MAX(fa.date_iso) DESC
     LIMIT ?`,
    [limit]
  );
}

export async function fournisseurs_inactifs() {
  const db = await getDb();
  return db.select(
    "SELECT id, nom, email FROM fournisseurs WHERE actif = 0 ORDER BY nom"
  );
}

export async function top_fournisseurs_list(mama_id: string, limit = 5) {
  const db = await getDb();
  return db.select(
    `SELECT fournisseur_id as id,
            strftime('%Y-%m', date_iso) as mois,
            SUM(montant) as montant
       FROM factures
       WHERE mama_id = ?
       GROUP BY fournisseur_id, mois
       ORDER BY montant DESC
       LIMIT ?`,
    [mama_id, limit]
  );
}

export async function achats_mensuels_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    `SELECT strftime('%Y-%m', f.date_iso) AS mois,
            SUM(l.quantite * l.prix_unitaire) AS montant
       FROM factures f
       LEFT JOIN facture_lignes l ON l.facture_id = f.id
       WHERE f.mama_id = ?
       GROUP BY mois
       ORDER BY mois`,
    [mama_id]
  );
}

// Notes fournisseurs
export async function fournisseur_notes_list(fournisseurId: number) {
  const db = await getDb();
  return db.select(
    "SELECT * FROM fournisseur_notes WHERE fournisseur_id = ? ORDER BY date DESC",
    [fournisseurId]
  );
}

export async function fournisseur_notes_add(note: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(note);
  if (!entries.length) return;
  const cols = entries.map(([k]) => k).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  const params = entries.map(([, v]) => v);
  await db.execute(
    `INSERT INTO fournisseur_notes (${cols}) VALUES (${placeholders})`,
    params
  );
}

export async function fournisseur_notes_delete(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM fournisseur_notes WHERE id = ?", [id]);
}

// Périodes comptables
export async function periodes_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT * FROM periodes_comptables WHERE mama_id = ? ORDER BY debut DESC",
    [mama_id]
  );
}

export async function periodes_create({
  mama_id,
  debut,
  fin,
}: {
  mama_id: string;
  debut: string;
  fin: string;
}) {
  const db = await getDb();
  await db.execute(
    "UPDATE periodes_comptables SET actif = 0 WHERE mama_id = ?",
    [mama_id]
  );
  await db.execute(
    "INSERT INTO periodes_comptables(mama_id,debut,fin,cloturee,actif) VALUES(?,?,?,?,1)",
    [mama_id, debut, fin, 0]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return periodes_get(id as number, mama_id);
}

export async function periodes_get(id: number, mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT * FROM periodes_comptables WHERE id = ? AND mama_id = ?",
    [id, mama_id]
  );
  return rows[0] ?? null;
}

export async function periodes_active(mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT * FROM periodes_comptables WHERE mama_id = ? AND actif = 1 LIMIT 1",
    [mama_id]
  );
  return rows[0] ?? null;
}

export async function periodes_close(id: number, mama_id: string) {
  const db = await getDb();
  await db.execute(
    "UPDATE periodes_comptables SET cloturee = 1, actif = 0 WHERE id = ? AND mama_id = ?",
    [id, mama_id]
  );
}

// Produits
export async function produits_list(
  search = "",
  withCount = false,
  page = 1,
  pageSize = 20
) {
  const db = await getDb();
  const params: any[] = [];
  let sql =
    "SELECT p.id, p.nom, p.unite, p.famille, p.pmp, p.stock_theorique, p.zone_id, z.nom as zone" +
    " FROM produits p LEFT JOIN inventaire_zones z ON z.id = p.zone_id";
  if (search) {
    sql += " WHERE p.nom LIKE ?";
    params.push(`%${search}%`);
  }
  sql += " ORDER BY p.nom LIMIT ? OFFSET ?";
  params.push(pageSize, (page - 1) * pageSize);
  const rows = await db.select(sql, params);

  if (withCount) {
    const countSql = search
      ? "SELECT COUNT(*) as count FROM produits WHERE nom LIKE ?"
      : "SELECT COUNT(*) as count FROM produits";
    const countParams = search ? [`%${search}%`] : [];
    const [{ count }] = await db.select(countSql, countParams);
    return { rows, total: Number(count) };
  }

  return rows;
}

export async function produits_create({
  mama_id,
  nom,
  unite,
  famille,
  zone_id,
}: {
  mama_id?: string | null;
  nom: string;
  unite?: string | null;
  famille?: string | null;
  zone_id?: number | null;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO produits (mama_id, nom, unite, famille, zone_id, actif) VALUES (?,?,?,?,?,1)",
    [mama_id ?? null, nom, unite ?? null, famille ?? null, zone_id ?? null]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id as number;
}

export async function produits_update(id: string, fields: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE produits SET ${sets} WHERE id = ?`, params);
}

export async function produits_autocomplete(search: string, mama_id?: string | null) {
  const db = await getDb();
  const params: any[] = [];
  let sql =
    `SELECT p.id, p.nom, p.unite_id, u.nom AS unite, p.tva, p.dernier_prix
     FROM produits p
     LEFT JOIN unites u ON u.id = p.unite_id
     WHERE p.actif = 1`;
  if (mama_id) {
    sql += " AND p.mama_id = ?";
    params.push(mama_id);
  }
  sql += " AND p.nom LIKE ? ORDER BY p.nom LIMIT 10";
  params.push(`%${search}%`);
  const rows = await db.select(sql, params);
  return rows.map((p: any) => ({
    id: p.id,
    produit_id: p.id,
    nom: p.nom,
    unite_id: p.unite_id || "",
    unite: p.unite || "",
    tva: p.tva ?? 0,
    dernier_prix: p.dernier_prix ?? 0,
  }));
}

// Menu engineering
export async function menu_engineering_list({
  mama_id,
  mois,
  famille,
  actif,
}: {
  mama_id: string;
  mois: string;
  famille?: string;
  actif?: boolean;
}) {
  const db = await getDb();
  let sql = `
    SELECT f.id, f.nom, f.prix_vente, f.cout_par_portion,
           IFNULL(v.ventes,0) AS ventes
    FROM fiches_techniques f
    LEFT JOIN (
      SELECT fiche_id, SUM(quantite) AS ventes
      FROM ventes_fiches
      WHERE mama_id = ? AND strftime('%Y-%m', date_vente) = ?
      GROUP BY fiche_id
    ) v ON v.fiche_id = f.id
    WHERE f.mama_id = ?`;
  const params: any[] = [mama_id, mois, mama_id];
  if (famille) {
    sql += " AND f.famille_id = ?";
    params.push(famille);
  }
  if (typeof actif === "boolean") {
    sql += " AND f.actif = ?";
    params.push(actif ? 1 : 0);
  }
  sql += " ORDER BY f.nom";
  return db.select(sql, params);
}

export async function menu_engineering_save_vente({
  mama_id,
  fiche_id,
  date_vente,
  quantite,
  prix_vente_unitaire,
}: {
  mama_id: string;
  fiche_id: number;
  date_vente: string;
  quantite: number;
  prix_vente_unitaire?: number | null;
}) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO ventes_fiches(mama_id,fiche_id,date_vente,quantite,prix_vente_unitaire)
     VALUES(?,?,?,?,?)
     ON CONFLICT(mama_id,fiche_id,date_vente) DO UPDATE SET
       quantite=excluded.quantite,
       prix_vente_unitaire=excluded.prix_vente_unitaire`,
    [mama_id, fiche_id, date_vente, quantite, prix_vente_unitaire ?? null]
  );
}

// Réquisitions rapides
export async function requisitions_create({ zone, mama_id, date_requisition = new Date().toISOString().slice(0, 10) }:{ zone: string; mama_id: string; date_requisition?: string }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO requisitions(zone, mama_id, date_requisition) VALUES(?,?,?)",
    [zone, mama_id, date_requisition]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id as number;
}

export async function requisition_ligne_add({ requisition_id, produit_id, quantite, mama_id }:{ requisition_id: number; produit_id: number; quantite: number; mama_id: string }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO requisition_lignes(requisition_id, produit_id, quantite, mama_id) VALUES(?,?,?,?)",
    [requisition_id, produit_id, quantite, mama_id]
  );
}

// Factures (entête + lignes)
export async function facture_create({
  numero,
  fournisseur_id,
  date_iso,
  montant,
  statut,
}: {
  numero?: string;
  fournisseur_id?: number | null;
  date_iso: string;
  montant?: number | null;
  statut?: string | null;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO factures(numero,fournisseur_id,date_iso,montant,statut) VALUES(?,?,?,?,?)",
    [numero ?? null, fournisseur_id ?? null, date_iso, montant ?? null, statut ?? null]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id as number;
}
export async function facture_add_ligne({ facture_id, produit_id, quantite, prix_unitaire }:
  {facture_id:number; produit_id:number; quantite:number; prix_unitaire:number}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO facture_lignes(facture_id,produit_id,quantite,prix_unitaire) VALUES(?,?,?,?)",
    [facture_id, produit_id, quantite, prix_unitaire]
  );
}

export async function facture_get(id: string | number) {
  const db = await getDb();
  const heads = await db.select(
    "SELECT id, fournisseur_id, date_iso FROM factures WHERE id = ?",
    [id]
  );
  const head = heads[0];
  if (!head) return null;
  const lignes = await db.select(
    "SELECT id, produit_id, quantite, prix_unitaire FROM facture_lignes WHERE facture_id = ?",
    [id]
  );
  return { ...head, lignes };
}

export async function facture_lignes_by_facture(facture_id: number) {
  const db = await getDb();
  return db.select(
    "SELECT id, produit_id, quantite, prix_unitaire FROM facture_lignes WHERE facture_id = ? ORDER BY id",
    [facture_id]
  );
}

export async function facture_ligne_get(id: number) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT id, produit_id, quantite, prix_unitaire FROM facture_lignes WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

export async function facture_ligne_update(id: number, fields: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE facture_lignes SET ${sets} WHERE id = ?`, params);
}

export async function facture_ligne_delete(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM facture_lignes WHERE id = ?", [id]);
}

export async function facture_update(id: number, fields: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE factures SET ${sets} WHERE id = ?`, params);
}

export async function facture_delete(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM facture_lignes WHERE facture_id = ?", [id]);
  await db.execute("DELETE FROM factures WHERE id = ?", [id]);
}

export async function factures_update_status(ids: number[], statut: string) {
  if (!ids.length) return;
  const db = await getDb();
  const placeholders = ids.map(() => "?").join(",");
  await db.execute(`UPDATE factures SET statut = ? WHERE id IN (${placeholders})`, [statut, ...ids]);
}

export async function price_trends_list(mama_id: string, produit_id: string | number) {
  const db = await getDb();
  return db.select(
    `SELECT mois, prix_moyen
     FROM v_tendance_prix_produit
     WHERE mama_id = ? AND produit_id = ?
     ORDER BY mois`,
    [mama_id, produit_id]
  );
}

export async function comparatif_produit(produit_id: number) {
  const db = await getDb();
  return db.select(
    `SELECT l.prix_unitaire AS prix_achat,
            f.date_iso AS date_livraison,
            f.fournisseur_id,
            fo.nom AS fournisseur_nom
     FROM facture_lignes l
     JOIN factures f ON f.id = l.facture_id
     JOIN fournisseurs fo ON fo.id = f.fournisseur_id
     WHERE l.produit_id = ?
     ORDER BY f.date_iso DESC`,
    [produit_id]
  );
}

export async function compta_journal_lines(
  mama_id: string,
  start: string,
  end: string
) {
  const db = await getDb();
  return db.select(
    `SELECT l.quantite,
            l.prix_unitaire AS prix,
            l.tva,
            l.facture_id,
            f.date_iso AS date_facture,
            fo.nom AS fournisseur
     FROM facture_lignes l
     JOIN factures f ON f.id = l.facture_id
     LEFT JOIN fournisseurs fo ON fo.id = f.fournisseur_id
     WHERE l.mama_id = ?
       AND f.date_iso >= ?
       AND f.date_iso < ?`,
    [mama_id, start, end]
  );
}

export async function compta_mapping_list(mama_id: string, type: string) {
  const db = await getDb();
  return db.select(
    `SELECT cle, compte FROM compta_mapping
     WHERE mama_id = ? AND type = ?`,
    [mama_id, type]
  );
}

export async function closeDb() {
  await baseCloseDb();
}


export async function backupDb() {
  const src = await dataDbPath();
  const { save } = await import("@tauri-apps/plugin-dialog");
  const dest = await save({ defaultPath: "mamastock-backup.db", filters: [{ name: "DB", extensions: ["db"] }] });
  if (!dest) throw new Error("Sauvegarde annulée");
  const { copyFile } = await import("@tauri-apps/plugin-fs");
  await copyFile(src, dest);
  return dest;
}

export async function restoreDb(file: string) {
  const dest = await dataDbPath();
  const { copyFile } = await import("@tauri-apps/plugin-fs");
  await copyFile(file, dest);
}

export async function maintenanceDb() {
  const db = await getDb();
  await db.execute("VACUUM");
  await db.execute("ANALYZE");
}

// Config helpers for data/export directories
export async function getDataDir() {
  if (!isTauri) return "";
  const cfg = (await readConfig()) || {};
  return cfg.dataDir || (await inAppDir("data"));
}

export async function setDataDir(dir: string) {
  const cfg = (await readConfig()) || {};
  cfg.dataDir = dir;
  await writeConfig(cfg);
}

export async function getExportDir() {
  if (!isTauri) return "";
  const cfg = (await readConfig()) || {};
  return cfg.exportDir || (await inAppDir("export"));
}

export async function setExportDir(dir: string) {
  const cfg = (await readConfig()) || {};
  cfg.exportDir = dir;
  await writeConfig(cfg);
}

export async function factures_list(opts: {
  search?: string;
  fournisseur_id?: number;
  statut?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { search = "", fournisseur_id, statut, page = 1, pageSize = 20 } = opts;
  const db = await getDb();
  const params: any[] = [];
  let sql =
    "SELECT f.id, f.numero, f.date_iso AS date_facture, f.montant, f.statut, f.fournisseur_id, fr.nom as fournisseur_nom FROM factures f LEFT JOIN fournisseurs fr ON fr.id = f.fournisseur_id";
  const where: string[] = [];
  if (search) {
    where.push("f.numero LIKE ?");
    params.push(`%${search}%`);
  }
  if (fournisseur_id) {
    where.push("f.fournisseur_id = ?");
    params.push(fournisseur_id);
  }
  if (statut) {
    where.push("f.statut = ?");
    params.push(statut);
  }
  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }
  sql += " ORDER BY f.date_iso DESC LIMIT ? OFFSET ?";
  const paramsWithLimit = params.concat([pageSize, (page - 1) * pageSize]);
  const rows = await db.select(sql, paramsWithLimit);

  const countSql =
    "SELECT COUNT(*) as count FROM factures f" +
    (where.length ? " WHERE " + where.join(" AND ") : "");
  const [{ count }] = await db.select(countSql, params);
  return { factures: rows, total: Number(count) };
}

// Fiches techniques
export async function fiche_cout_history_list(fiche_id: number) {
  const db = await getDb();
  return db.select(
    "SELECT * FROM fiche_cout_history WHERE fiche_id = ? ORDER BY changed_at DESC",
    [fiche_id]
  );
}

export async function fiches_autocomplete({ query = "", excludeId }: { query?: string; excludeId?: number } = {}) {
  const db = await getDb();
  const params: any[] = [];
  let sql = "SELECT id, nom, cout_par_portion, actif FROM fiches_techniques WHERE actif = 1";
  if (query) {
    sql += " AND nom LIKE ?";
    params.push(`%${query}%`);
  }
  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }
  sql += " ORDER BY nom LIMIT 10";
  return db.select(sql, params);
}

export async function fiches_actives_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT id, nom, famille, cout_portion, prix_vente FROM fiches_techniques WHERE actif = 1 AND mama_id = ? ORDER BY nom",
    [mama_id]
  );
}

export async function carte_list(mama_id: string, type?: string) {
  const db = await getDb();
  let sql =
    "SELECT * FROM fiches_techniques WHERE carte_actuelle = 1 AND mama_id = ?";
  const params: any[] = [mama_id];
  if (type) {
    sql += " AND type_carte = ?";
    params.push(type);
  }
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

export async function fiches_list(
  mama_id: string,
  {
    search = "",
    actif,
    famille,
    page = 1,
    limit = 20,
    sortBy = "nom",
    asc = true,
  }: {
    search?: string;
    actif?: boolean;
    famille?: number | string | null;
    page?: number;
    limit?: number;
    sortBy?: string;
    asc?: boolean;
  } = {}
) {
  const db = await getDb();
  const filters: string[] = ["mama_id = ?"];
  const params: any[] = [mama_id];
  if (search) {
    filters.push("nom LIKE ?");
    params.push(`%${search}%`);
  }
  if (typeof actif === "boolean") {
    filters.push("actif = ?");
    params.push(actif ? 1 : 0);
  }
  if (famille) {
    filters.push("famille_id = ?");
    params.push(famille);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const order = ["nom", "cout_par_portion"].includes(sortBy) ? sortBy : "nom";
  const rows = await db.select(
    `SELECT id, nom, portions, cout_total, cout_par_portion, famille_id, prix_vente, actif FROM fiches_techniques ${where} ORDER BY ${order} ${asc ? "ASC" : "DESC"} LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  const [{ count }] = await db.select(
    `SELECT COUNT(*) as count FROM fiches_techniques ${where}`,
    params
  );
  return { rows, total: Number(count) };
}

export async function fiche_get(id: number, mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT * FROM fiches_techniques WHERE id = ? AND mama_id = ?",
    [id, mama_id]
  );
  const fiche = rows[0];
  if (!fiche) return null;
  fiche.lignes = await db.select(
    `SELECT l.id, l.quantite, l.produit_id, p.nom as produit_nom, p.unite as unite_nom,
            l.sous_fiche_id, sf.nom as sous_fiche_nom, sf.cout_par_portion as sous_fiche_cout_par_portion
     FROM fiche_lignes l
     LEFT JOIN produits p ON p.id = l.produit_id
     LEFT JOIN fiches_techniques sf ON sf.id = l.sous_fiche_id
     WHERE l.fiche_id = ? AND l.mama_id = ?
     ORDER BY l.id`,
    [id, mama_id]
  );
  return fiche;
}

export async function fiches_create(
  fiche: Record<string, any>,
  lignes: Array<{ produit_id?: number; sous_fiche_id?: number; quantite: number }>
) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO fiches_techniques (mama_id, nom, famille_id, portions, cout_total, cout_par_portion, prix_vente, actif) VALUES (?,?,?,?,?,?,?,?)",
    [
      fiche.mama_id,
      fiche.nom,
      fiche.famille_id ?? null,
      fiche.portions ?? 1,
      fiche.cout_total ?? 0,
      fiche.cout_par_portion ?? 0,
      fiche.prix_vente ?? 0,
      fiche.actif === false ? 0 : 1,
    ]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  if (Array.isArray(lignes) && lignes.length) {
    for (const l of lignes) {
      await db.execute(
        "INSERT INTO fiche_lignes (fiche_id, produit_id, sous_fiche_id, quantite, mama_id) VALUES (?,?,?,?,?)",
        [id, l.produit_id ?? null, l.sous_fiche_id ?? null, l.quantite, fiche.mama_id]
      );
    }
  }
  return id as number;
}

export async function fiches_update(
  id: number,
  mama_id: string,
  fields: Record<string, any>,
  lignes: Array<{ produit_id?: number; sous_fiche_id?: number; quantite: number }> = []
) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (entries.length) {
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const params = entries.map(([, v]) => v);
    params.push(id, mama_id);
    await db.execute(`UPDATE fiches_techniques SET ${sets} WHERE id = ? AND mama_id = ?`, params);
  }
  await db.execute("DELETE FROM fiche_lignes WHERE fiche_id = ? AND mama_id = ?", [id, mama_id]);
  if (Array.isArray(lignes) && lignes.length) {
    for (const l of lignes) {
      await db.execute(
        "INSERT INTO fiche_lignes (fiche_id, produit_id, sous_fiche_id, quantite, mama_id) VALUES (?,?,?,?,?)",
        [id, l.produit_id ?? null, l.sous_fiche_id ?? null, l.quantite, mama_id]
      );
    }
  }
}

export async function fiches_delete(id: number, mama_id: string) {
  const db = await getDb();
  await db.execute(
    "UPDATE fiches_techniques SET actif = 0 WHERE id = ? AND mama_id = ?",
    [id, mama_id]
  );
}

export async function fiches_duplicate(id: number, mama_id: string) {
  const fiche = await fiche_get(id, mama_id);
  if (!fiche) return null;
  const { lignes = [], ...rest } = fiche;
  return await fiches_create({ ...rest, nom: `${rest.nom} (copie)` }, lignes);
}

// Familles
export async function familles_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT id, nom, actif, mama_id FROM familles WHERE mama_id = ? ORDER BY nom",
    [mama_id]
  );
}

export async function familles_insert({ nom, actif = true, mama_id }: { nom: string; actif?: boolean; mama_id: string }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO familles (nom, actif, mama_id) VALUES (?,?,?)",
    [nom, actif ? 1 : 0, mama_id]
  );
}

export async function familles_update(id: string, mama_id: string, fields: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id, mama_id);
  await db.execute(`UPDATE familles SET ${sets} WHERE id = ? AND mama_id = ?`, params);
}

export async function familles_delete(id: string, mama_id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM familles WHERE id = ? AND mama_id = ?", [id, mama_id]);
}

export async function familles_batch_delete(ids: string[], mama_id: string) {
  if (!ids.length) return;
  const db = await getDb();
  const placeholders = ids.map(() => "?").join(",");
  const params = [...ids, mama_id];
  await db.execute(`DELETE FROM familles WHERE id IN (${placeholders}) AND mama_id = ?`, params);
}

// Sous-familles
export async function sous_familles_list(
  mama_id: string,
  {
    search = "",
    actif,
    famille_id,
  }: { search?: string; actif?: boolean; famille_id?: number | string } = {}
) {
  const db = await getDb();
  let sql =
    "SELECT id, nom, actif, famille_id, mama_id FROM sous_familles WHERE mama_id = ?";
  const params: any[] = [mama_id];
  if (typeof actif === "boolean") {
    sql += " AND actif = ?";
    params.push(actif ? 1 : 0);
  }
  if (famille_id) {
    sql += " AND famille_id = ?";
    params.push(famille_id);
  }
  if (search) {
    sql += " AND nom LIKE ?";
    params.push(`%${search}%`);
  }
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

export async function sous_familles_insert({
  nom,
  actif = true,
  famille_id,
  mama_id,
}: {
  nom: string;
  actif?: boolean;
  famille_id: number;
  mama_id: string;
}) {
  const db = await getDb();
  const actifVal = actif ? 1 : 0;
  await db.execute(
    "INSERT INTO sous_familles (nom, actif, famille_id, mama_id) VALUES (?,?,?,?)",
    [nom, actifVal, famille_id, mama_id]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return { id, nom, actif: actifVal, famille_id, mama_id };
}

export async function sous_familles_update(
  id: string | number,
  mama_id: string,
  fields: Record<string, any>
) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id, mama_id);
  await db.execute(`UPDATE sous_familles SET ${sets} WHERE id = ? AND mama_id = ?`, params);
}

export async function sous_familles_delete(id: string | number, mama_id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM sous_familles WHERE id = ? AND mama_id = ?", [id, mama_id]);
}

// Unités
export async function unites_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT id, nom, mama_id, actif FROM unites WHERE mama_id = ? ORDER BY nom",
    [mama_id]
  );
}

// Zones de stock
export async function zones_stock_list(mama_id: string, onlyActive = true) {
  const db = await getDb();
  let sql =
    "SELECT id, nom, mama_id, actif FROM inventaire_zones WHERE mama_id = ?";
  const params: any[] = [mama_id];
  if (onlyActive) {
    sql += " AND actif = 1";
  }
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

// Zones génériques
export async function zones_list({
  q = "",
  type,
  actif,
}: { q?: string; type?: string; actif?: boolean } = {}) {
  const db = await getDb();
  const params: any[] = [];
  let sql =
    "SELECT id, nom, type, parent_id, position, actif, created_at FROM inventaire_zones";
  const where: string[] = [];
  if (q) {
    where.push("nom LIKE ?");
    params.push(`%${q}%`);
  }
  if (type) {
    where.push("type = ?");
    params.push(type);
  }
  if (actif !== undefined) {
    where.push("actif = ?");
    params.push(actif ? 1 : 0);
  }
  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }
  sql += " ORDER BY position ASC, nom ASC";
  return db.select(sql, params);
}

export async function zone_get(id: string | number) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT id, nom, type, parent_id, position, actif, created_at FROM inventaire_zones WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

export async function zone_create({
  nom,
  type = null,
  parent_id = null,
  position = null,
  actif = true,
}: {
  nom: string;
  type?: string | null;
  parent_id?: number | null;
  position?: number | null;
  actif?: boolean;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO inventaire_zones(nom,type,parent_id,position,actif) VALUES(?,?,?,?,?)",
    [nom, type, parent_id, position, actif ? 1 : 0]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id as number;
}

export async function zone_update(id: string | number, fields: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE inventaire_zones SET ${sets} WHERE id = ?`, params);
}

export async function zone_delete(id: string | number) {
  const db = await getDb();
  await db.execute("DELETE FROM inventaire_zones WHERE id = ?", [id]);
}

export async function zones_reorder(list: { id: number; position: number }[]) {
  const db = await getDb();
  for (const { id, position } of list) {
    await db.execute(
      "UPDATE inventaire_zones SET position = ? WHERE id = ?",
      [position, id]
    );
  }
}

export async function zones_accessible({ mode }: { mode?: string } = {}) {
  let rows = await zones_list({ actif: true });
  if (mode === "requisition") {
    rows = rows.filter((z: any) => ["cave", "shop"].includes(z.type));
  }
  return rows;
}

export async function zones_droits_list(zone_id: number, mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT id, zone_id, user_id, lecture, ecriture, transfert, requisition FROM zones_droits WHERE zone_id = ? AND mama_id = ? ORDER BY user_id",
    [zone_id, mama_id]
  );
}

export async function zones_droits_upsert({ zone_id, user_id, lecture, ecriture, transfert, requisition, mama_id }: {
  zone_id: number;
  user_id: string;
  lecture: boolean;
  ecriture: boolean;
  transfert: boolean;
  requisition: boolean;
  mama_id: string;
}) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO zones_droits(zone_id,mama_id,user_id,lecture,ecriture,transfert,requisition)
     VALUES(?,?,?,?,?,?,?)
     ON CONFLICT(zone_id,mama_id,user_id) DO UPDATE SET
       lecture=excluded.lecture,
       ecriture=excluded.ecriture,
       transfert=excluded.transfert,
       requisition=excluded.requisition`,
    [
      zone_id,
      mama_id,
      user_id,
      lecture ? 1 : 0,
      ecriture ? 1 : 0,
      transfert ? 1 : 0,
      requisition ? 1 : 0,
    ]
  );
}

export async function zones_droits_delete(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM zones_droits WHERE id = ?", [id]);
}

// Produits par zone
export async function zone_products_list(zone_id: number, mama_id: string) {
  const db = await getDb();
  try {
    return await db.select(
      "SELECT * FROM v_produits_par_zone WHERE zone_id = ? AND mama_id = ?",
      [zone_id, mama_id]
    );
  } catch {
    return await db.select(
      "SELECT * FROM produits WHERE zone_id = ? AND mama_id = ?",
      [zone_id, mama_id]
    );
  }
}

export async function zone_products_move(
  mama_id: string,
  srcZoneId: number,
  dstZoneId: number,
  removeSrc = false
) {
  const db = await getDb();
  await db.execute(
    "UPDATE produits SET zone_id = ? WHERE zone_id = ? AND mama_id = ?",
    [dstZoneId, srcZoneId, mama_id]
  );
  if (removeSrc) {
    await db.execute(
      "DELETE FROM inventaire_zones WHERE id = ? AND mama_id = ?",
      [srcZoneId, mama_id]
    );
  }
}

export async function zone_products_copy(
  mama_id: string,
  srcZoneId: number,
  dstZoneId: number,
  overwrite = false
) {
  const db = await getDb();
  if (overwrite) {
    await db.execute(
      "UPDATE produits SET zone_id = NULL WHERE zone_id = ? AND mama_id = ?",
      [dstZoneId, mama_id]
    );
  }
  await db.execute(
    "INSERT INTO produits (nom, unite, famille, pmp, stock_theorique, zone_id, actif) SELECT nom, unite, famille, pmp, stock_theorique, ?, actif FROM produits WHERE zone_id = ? AND mama_id = ?",
    [dstZoneId, srcZoneId, mama_id]
  );
}

export async function zone_products_merge(
  mama_id: string,
  srcZoneId: number,
  dstZoneId: number
) {
  const db = await getDb();
  await db.execute(
    "UPDATE produits SET zone_id = ? WHERE zone_id = ? AND mama_id = ?",
    [dstZoneId, srcZoneId, mama_id]
  );
  await db.execute(
    "DELETE FROM inventaire_zones WHERE id = ? AND mama_id = ?",
    [srcZoneId, mama_id]
  );
}

// Alertes
export async function alertes_list(
  mama_id: string,
  { search = "", actif = null }: { search?: string; actif?: boolean } = {}
) {
  const db = await getDb();
  const params: any[] = [mama_id];
  let sql = "SELECT * FROM regles_alertes WHERE mama_id = ?";
  if (typeof actif === "boolean") {
    sql += " AND actif = ?";
    params.push(actif ? 1 : 0);
  }
  if (search) {
    sql +=
      " AND produit_id IN (SELECT id FROM produits WHERE nom LIKE ?)";
    params.push(`%${search}%`);
  }
  sql += " ORDER BY created_at DESC";
  return db.select(sql, params);
}

export async function alertes_add({
  mama_id,
  produit_id,
  threshold,
  actif = 1,
}: {
  mama_id: string;
  produit_id: number;
  threshold: number;
  actif?: number | boolean;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO regles_alertes(mama_id,produit_id,threshold,actif) VALUES(?,?,?,?)",
    [mama_id, produit_id, threshold, actif ? 1 : 0]
  );
}

export async function alertes_update(
  id: number,
  fields: Record<string, any>
) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE regles_alertes SET ${sets} WHERE id = ?`, params);
}

export async function alertes_delete(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM regles_alertes WHERE id = ?", [id]);
}

// Onboarding
export async function onboarding_fetch(user_id: string, mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT etape, statut FROM etapes_onboarding WHERE user_id = ? AND mama_id = ? ORDER BY created_at ASC LIMIT 1",
    [user_id, mama_id]
  );
  return rows[0] ?? null;
}

export async function onboarding_start(user_id: string, mama_id: string) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO etapes_onboarding(user_id,mama_id,etape,statut) VALUES(?,?, '0','en cours')",
    [user_id, mama_id]
  );
}

// Performance fiches
export async function performance_fiches_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT * FROM v_performance_fiches WHERE mama_id = ?",
    [mama_id]
  );
}

// Tâches
export async function taches_list(mama_id: string) {
  const db = await getDb();
  return db.select(
    `SELECT t.*, u.nom AS assigned_nom
       FROM taches t
       LEFT JOIN utilisateurs u ON t.assigned_to = u.id
       WHERE t.mama_id = ?
       ORDER BY t.next_echeance`,
    [mama_id]
  );
}

export async function tache_get(id: number, mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    `SELECT t.*, u.nom AS assigned_nom
       FROM taches t
       LEFT JOIN utilisateurs u ON t.assigned_to = u.id
       WHERE t.id = ? AND t.mama_id = ?`,
    [id, mama_id]
  );
  return rows[0] ?? null;
}

export async function taches_by_status(
  mama_id: string,
  statut: string
) {
  const db = await getDb();
  return db.select(
    `SELECT t.*, u.nom AS assigned_nom
       FROM taches t
       LEFT JOIN utilisateurs u ON t.assigned_to = u.id
       WHERE t.mama_id = ? AND t.statut = ?
       ORDER BY t.next_echeance`,
    [mama_id, statut]
  );
}

export async function tache_add(values: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(values);
  if (!entries.length) return null;
  const cols = entries.map(([k]) => k).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  const params = entries.map(([, v]) => v);
  await db.execute(
    `INSERT INTO taches (${cols}) VALUES (${placeholders})`,
    params
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return tache_get(id as number, values.mama_id);
}

export async function tache_update(
  id: number,
  mama_id: string,
  fields: Record<string, any>
) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return null;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id, mama_id);
  await db.execute(
    `UPDATE taches SET ${sets} WHERE id = ? AND mama_id = ?`,
    params
  );
  return tache_get(id, mama_id);
}

export async function tache_delete(id: number, mama_id: string) {
  const db = await getDb();
  await db.execute(
    "DELETE FROM taches WHERE id = ? AND mama_id = ?",
    [id, mama_id]
  );
}

// -------------------------------------------------------------
// Inventaires

async function ensureInventaireTables() {
  const db = await getDb();
  await db.execute(
    `CREATE TABLE IF NOT EXISTS inventaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mama_id TEXT NOT NULL,
      reference TEXT,
      date_inventaire TEXT NOT NULL,
      date_debut TEXT,
      zone_id INTEGER,
      periode_id INTEGER,
      document TEXT,
      cloture INTEGER NOT NULL DEFAULT 0,
      actif INTEGER NOT NULL DEFAULT 1
    )`
  );
  await db.execute(
    `CREATE TABLE IF NOT EXISTS produits_inventaire (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventaire_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite_reelle REAL NOT NULL,
      mama_id TEXT NOT NULL,
      actif INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(inventaire_id) REFERENCES inventaires(id),
      FOREIGN KEY(produit_id) REFERENCES produits(id)
    )`
  );
}

export async function inventaires_list(mama_id: string) {
  await ensureInventaireTables();
  const db = await getDb();
  return db.select(
    `SELECT i.*, z.nom as zone
     FROM inventaires i
     LEFT JOIN inventaire_zones z ON z.id = i.zone_id
     WHERE i.mama_id = ?
     ORDER BY date_inventaire DESC`,
    [mama_id]
  );
}

export async function inventaire_get(id: number, mama_id: string) {
  await ensureInventaireTables();
  const db = await getDb();
  const rows = await db.select(
    `SELECT i.*, z.nom as zone
     FROM inventaires i
     LEFT JOIN inventaire_zones z ON z.id = i.zone_id
     WHERE i.id = ? AND i.mama_id = ?`,
    [id, mama_id]
  );
  if (!rows.length) return null;
  const inv = rows[0];
  const lignes = await db.select(
    `SELECT l.*, p.nom, p.unite, p.pmp, p.stock_theorique
     FROM produits_inventaire l
     LEFT JOIN produits p ON p.id = l.produit_id
     WHERE l.inventaire_id = ? AND l.mama_id = ? AND l.actif = 1`,
    [id, mama_id]
  );
  inv.lignes = lignes;
  return inv;
}

export async function inventaire_create({
  mama_id,
  reference,
  date_inventaire,
  date_debut = null,
  zone_id = null,
  document = null,
  periode_id = null,
  lignes = [],
}: {
  mama_id: string;
  reference?: string;
  date_inventaire: string;
  date_debut?: string | null;
  zone_id?: number | null;
  document?: string | null;
  periode_id?: number | null;
  lignes?: { produit_id: number; quantite_reelle: number }[];
}) {
  await ensureInventaireTables();
  const db = await getDb();
  await db.execute(
    `INSERT INTO inventaires(reference,date_inventaire,date_debut,zone_id,document,periode_id,mama_id,actif,cloture)
     VALUES(?,?,?,?,?,?,?,1,0)`,
    [reference ?? null, date_inventaire, date_debut, zone_id, document, periode_id, mama_id]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  for (const l of lignes) {
    await db.execute(
      `INSERT INTO produits_inventaire(inventaire_id,produit_id,quantite_reelle,mama_id,actif)
       VALUES(?,?,?,?,1)`,
      [id, l.produit_id, l.quantite_reelle, mama_id]
    );
  }
  return inventaire_get(id as number, mama_id);
}

export async function inventaire_update(
  id: number,
  mama_id: string,
  fields: Record<string, any>
) {
  await ensureInventaireTables();
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return null;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id, mama_id);
  await db.execute(
    `UPDATE inventaires SET ${sets} WHERE id = ? AND mama_id = ?`,
    params
  );
  return inventaire_get(id, mama_id);
}

export async function inventaire_delete(id: number, mama_id: string) {
  await ensureInventaireTables();
  const db = await getDb();
  await db.execute(
    `UPDATE inventaires SET actif = 0 WHERE id = ? AND mama_id = ?`,
    [id, mama_id]
  );
}

export async function inventaire_reactivate(id: number, mama_id: string) {
  await ensureInventaireTables();
  const db = await getDb();
  await db.execute(
    `UPDATE inventaires SET actif = 1 WHERE id = ? AND mama_id = ?`,
    [id, mama_id]
  );
}

export async function inventaire_lignes_list(
  inventaire_id: number,
  mama_id: string
) {
  await ensureInventaireTables();
  const db = await getDb();
  return db.select(
    `SELECT l.*, p.nom, p.unite, p.pmp, p.stock_theorique
     FROM produits_inventaire l
     LEFT JOIN produits p ON p.id = l.produit_id
     WHERE l.inventaire_id = ? AND l.mama_id = ? AND l.actif = 1`,
    [inventaire_id, mama_id]
  );
}

export async function inventaire_ligne_add({
  inventaire_id,
  produit_id,
  quantite_reelle,
  mama_id,
}: {
  inventaire_id: number;
  produit_id: number;
  quantite_reelle: number;
  mama_id: string;
}) {
  await ensureInventaireTables();
  const db = await getDb();
  await db.execute(
    `INSERT INTO produits_inventaire(inventaire_id,produit_id,quantite_reelle,mama_id,actif)
     VALUES(?,?,?,?,1)`,
    [inventaire_id, produit_id, quantite_reelle, mama_id]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id as number;
}

export async function inventaire_ligne_update(
  id: number,
  mama_id: string,
  fields: Record<string, any>
) {
  await ensureInventaireTables();
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return null;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id, mama_id);
  await db.execute(
    `UPDATE produits_inventaire SET ${sets} WHERE id = ? AND mama_id = ?`,
    params
  );
  const rows = await db.select(
    `SELECT * FROM produits_inventaire WHERE id = ? AND mama_id = ?`,
    [id, mama_id]
  );
  return rows[0] ?? null;
}

export async function inventaire_ligne_delete(id: number, mama_id: string) {
  await ensureInventaireTables();
  const db = await getDb();
  await db.execute(
    `UPDATE produits_inventaire SET actif = 0 WHERE id = ? AND mama_id = ?`,
    [id, mama_id]
  );
}

export async function inventaire_cloture(
  id: number,
  mama_id: string
) {
  await ensureInventaireTables();
  const db = await getDb();
  const lignes = await db.select(
    `SELECT produit_id, quantite_reelle FROM produits_inventaire
     WHERE inventaire_id = ? AND mama_id = ? AND actif = 1`,
    [id, mama_id]
  );
  for (const l of lignes) {
    await db.execute(
      `UPDATE produits SET stock_theorique = ? WHERE id = ? AND mama_id = ?`,
      [l.quantite_reelle, l.produit_id, mama_id]
    );
  }
  await db.execute(
    `UPDATE inventaires SET cloture = 1 WHERE id = ? AND mama_id = ?`,
    [id, mama_id]
  );
}

export async function inventaire_last_closed(
  mama_id: string,
  beforeDate?: string
) {
  await ensureInventaireTables();
  const db = await getDb();
  let sql = `SELECT date_inventaire as date FROM inventaires WHERE mama_id = ? AND cloture = 1`;
  const params: any[] = [mama_id];
  if (beforeDate) {
    sql += " AND date_inventaire < ?";
    params.push(beforeDate);
  }
  sql += " ORDER BY date_inventaire DESC LIMIT 1";
  const rows = await db.select(sql, params);
  return rows[0] ?? null;
}

export async function ecarts_inventaire_list(
  mama_id: string,
  { date_start, date_end }: { date_start?: string; date_end?: string } = {}
) {
  await ensureInventaireTables();
  const db = await getDb();
  let sql =
    "SELECT * FROM v_ecarts_inventaire WHERE mama_id = ?";
  const params: any[] = [mama_id];
  if (date_start) {
    sql += " AND date >= ?";
    params.push(date_start);
  }
  if (date_end) {
    sql += " AND date <= ?";
    params.push(date_end);
  }
  try {
    return await db.select(sql, params);
  } catch {
    return [];
  }
}



// Reporting financier
export async function reporting_financier({
  mama_id,
  debut,
  fin,
}: {
  mama_id: string;
  debut: string;
  fin: string;
}) {
  const db = await getDb();
  const [row] = await db.select(
    `SELECT
       (SELECT IFNULL(SUM(quantite * IFNULL(prix_vente_unitaire,0)),0)
          FROM ventes_fiches
          WHERE mama_id = ? AND date_vente BETWEEN ? AND ?) AS total_ventes,
       (SELECT IFNULL(SUM(l.quantite * l.prix_unitaire),0)
          FROM factures f
          JOIN facture_lignes l ON l.facture_id = f.id
          WHERE f.date_iso BETWEEN ? AND ?) AS total_achats`,
    [mama_id, debut, fin, debut, fin]
  );
  const total_ventes = row?.total_ventes ?? 0;
  const total_achats = row?.total_achats ?? 0;
  const marge = total_ventes - total_achats;
  const [{ valeur_stock = 0 } = {}] = await db.select(
    `SELECT IFNULL(SUM(valeur_stock),0) as valeur_stock FROM produits WHERE mama_id = ?`,
    [mama_id]
  );
  return { total_ventes, total_achats, marge, valeur_stock };
}

export async function consolidation_performance({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const db = await getDb();
  const rows = await db.select(
    `SELECT mama_id,
            SUM(total_ventes) AS total_ventes,
            SUM(total_achats) AS total_achats,
            SUM(valeur_stock) AS valeur_stock
     FROM (
       SELECT mama_id,
              SUM(quantite * IFNULL(prix_vente_unitaire,0)) AS total_ventes,
              0 AS total_achats,
              0 AS valeur_stock
       FROM ventes_fiches
       WHERE date_vente BETWEEN ? AND ?
       GROUP BY mama_id
       UNION ALL
       SELECT f.mama_id,
              0,
              SUM(l.quantite * l.prix_unitaire) AS total_achats,
              0
       FROM factures f
       JOIN facture_lignes l ON l.facture_id = f.id
       WHERE f.date_iso BETWEEN ? AND ?
       GROUP BY f.mama_id
       UNION ALL
       SELECT mama_id, 0, 0, SUM(valeur_stock)
       FROM produits
       GROUP BY mama_id
     ) t
     GROUP BY mama_id`,
    [start, end, start, end]
  );
  return rows.map((r: any) => ({
    ...r,
    marge: (r.total_ventes || 0) - (r.total_achats || 0),
  }));
}

export async function stats_cost_centers_list(
  mama_id: string,
  {
    debut = null,
    fin = null,
  }: { debut?: string | null; fin?: string | null } = {}
) {
  const db = await getDb();
  const clauses = ["mama_id = ?"];
  const params: any[] = [mama_id];
  if (debut) {
    clauses.push("date >= ?");
    params.push(debut);
  }
  if (fin) {
    clauses.push("date <= ?");
    params.push(fin);
  }
  const where = "WHERE " + clauses.join(" AND ");
  return db.select(
    `SELECT * FROM stats_cost_centers ${where} ORDER BY date ASC`,
    params
  );
}

export async function emails_envoyes_list(
  mama_id: string,
  {
    statut,
    email,
    commande_id,
    date_start,
    date_end,
    limit = 50,
    offset = 0,
  }: {
    statut?: string;
    email?: string;
    commande_id?: string;
    date_start?: string;
    date_end?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const db = await getDb();
  const clauses = ["mama_id = ?"];
  const params: any[] = [mama_id];
  if (statut) {
    clauses.push("statut = ?");
    params.push(statut);
  }
  if (email) {
    clauses.push("email LIKE ?");
    params.push(`%${email}%`);
  }
  if (commande_id) {
    clauses.push("commande_id = ?");
    params.push(commande_id);
  }
  if (date_start) {
    clauses.push("envoye_le >= ?");
    params.push(date_start);
  }
  if (date_end) {
    clauses.push("envoye_le <= ?");
    params.push(date_end);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db.select(
    `SELECT * FROM emails_envoyes ${where} ORDER BY envoye_le DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [{ count = 0 } = {}] = await db.select(
    `SELECT COUNT(*) as count FROM emails_envoyes ${where}`,
    params
  );
  return { rows, count };
}

// Usage statistics and security logs
export async function usage_stats_module_counts(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT module, COUNT(id) as count FROM usage_stats WHERE mama_id = ? GROUP BY module",
    [mama_id]
  );
}

export async function usage_stats_last_seen(mama_id: string, user_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT timestamp FROM usage_stats WHERE mama_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1",
    [mama_id, user_id]
  );
  return rows[0]?.timestamp ?? null;
}

export async function logs_securite_frequent_errors(mama_id: string) {
  const db = await getDb();
  return db.select(
    "SELECT description, COUNT(id) as count FROM logs_securite WHERE mama_id = ? AND type LIKE '%erreur%' GROUP BY description ORDER BY count DESC LIMIT 5",
    [mama_id]
  );
}

// Dashboards
export async function dashboards_list(utilisateur_id: string, mama_id: string) {
  const db = await getDb();
  const dashboards = await db.select(
    `SELECT id, nom, utilisateur_id, mama_id, created_at
     FROM tableaux_de_bord
     WHERE utilisateur_id = ? AND mama_id = ?
     ORDER BY created_at`,
    [utilisateur_id, mama_id]
  );
  for (const d of dashboards) {
    d.widgets = await db.select(
      `SELECT id, tableau_id, config, ordre, mama_id
       FROM gadgets
       WHERE tableau_id = ?
       ORDER BY ordre`,
      [d.id]
    );
    d.widgets = d.widgets.map((w: any) => ({
      ...w,
      config: w.config ? JSON.parse(w.config) : null,
    }));
  }
  return dashboards;
}

export async function dashboard_create({
  nom,
  utilisateur_id,
  mama_id,
}: {
  nom: string;
  utilisateur_id: string;
  mama_id: string;
}) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO tableaux_de_bord (nom, utilisateur_id, mama_id) VALUES (?,?,?)`,
    [nom, utilisateur_id, mama_id]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return {
    id,
    nom,
    utilisateur_id,
    mama_id,
    widgets: [] as any[],
  };
}

export async function gadget_add({
  tableau_id,
  config,
  mama_id,
}: {
  tableau_id: number;
  config: any;
  mama_id: string;
}) {
  const db = await getDb();
  const [{ max }] = await db.select(
    "SELECT IFNULL(MAX(ordre),0) as max FROM gadgets WHERE tableau_id = ?",
    [tableau_id]
  );
  const ordre = (max || 0) + 1;
  await db.execute(
    `INSERT INTO gadgets (tableau_id, config, ordre, mama_id) VALUES (?,?,?,?)`,
    [tableau_id, JSON.stringify(config ?? null), ordre, mama_id]
  );
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  const [row] = await db.select(
    `SELECT id, tableau_id, config, ordre, mama_id FROM gadgets WHERE id = ?`,
    [id]
  );
  return { ...row, config: row.config ? JSON.parse(row.config) : null };
}

export async function gadget_update(
  id: number,
  values: Record<string, any>
) {
  const db = await getDb();
  const entries = Object.entries(values).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v]);
  if (!entries.length) return null;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE gadgets SET ${sets} WHERE id = ?`, params);
  const [row] = await db.select(
    `SELECT id, tableau_id, config, ordre, mama_id FROM gadgets WHERE id = ?`,
    [id]
  );
  return { ...row, config: row.config ? JSON.parse(row.config) : null };
}

export async function gadget_delete(id: number) {
  const db = await getDb();
  await db.execute(`DELETE FROM gadgets WHERE id = ?`, [id]);
}

// --- Tâches : assignations d'utilisateurs ---
export async function tache_assign_users(tache_id: string, user_ids: string[]) {
  if (!user_ids.length) return;
  const db = await getDb();
  const values = user_ids.map(() => "(?, ?)").join(", ");
  const params: any[] = [];
  user_ids.forEach((uid) => {
    params.push(tache_id, uid);
  });
  await db.execute(
    `INSERT INTO utilisateurs_taches (tache_id, utilisateur_id) VALUES ${values}`,
    params
  );
}

export async function tache_unassign_user(tache_id: string, user_id: string) {
  const db = await getDb();
  await db.execute(
    `DELETE FROM utilisateurs_taches WHERE tache_id = ? AND utilisateur_id = ?`,
    [tache_id, user_id]
  );
}

// --- Requisitions : consommation moyenne ---
export async function requisitions_quantites_since(
  mama_id: string,
  sinceISO: string
) {
  const db = await getDb();
  return await db.select(
    `SELECT rl.quantite, r.date_requisition
       FROM requisition_lignes rl
       JOIN requisitions r ON r.id = rl.requisition_id
      WHERE r.mama_id = ?
        AND r.statut = 'réalisée'
        AND r.date_requisition >= ?
      ORDER BY r.date_requisition ASC`,
    [mama_id, sinceISO]
  );
}

// --- Costing carte ---
export async function costing_carte_list({
  mama_id,
  type,
  famille,
  actif,
}: {
  mama_id: string;
  type?: string;
  famille?: string;
  actif?: boolean;
}) {
  const db = await getDb();
  const params: any[] = [mama_id];
  let sql =
    "SELECT * FROM v_costing_carte WHERE mama_id = ?";
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (famille) {
    sql += " AND famille = ?";
    params.push(famille);
  }
  if (typeof actif === "boolean") {
    sql += " AND actif = ?";
    params.push(actif ? 1 : 0);
  }
  sql += " ORDER BY nom";
  return db.select(sql, params);
}

export async function settings_get(mama_id: string) {
  const db = await getDb();
  const rows = await db.select(
    "SELECT objectif_marge_pct, objectif_food_cost_pct FROM settings WHERE mama_id = ? LIMIT 1",
    [mama_id]
  );
  return rows[0] ?? null;
}

// --- Permissions ---
export async function permissions_list({
  mama_id,
  role_id,
  user_id,
}: {
  mama_id?: string;
  role_id?: string | number | null;
  user_id?: string | number | null;
}) {
  const db = await getDb();
  const conditions: string[] = [];
  const params: any[] = [];
  if (mama_id) {
    conditions.push("mama_id = ?");
    params.push(mama_id);
  }
  if (role_id) {
    conditions.push("role_id = ?");
    params.push(role_id);
  }
  if (user_id) {
    conditions.push("user_id = ?");
    params.push(user_id);
  }
  let sql = "SELECT * FROM permissions";
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY role_id ASC";
  return db.select(sql, params);
}

export async function permission_add(permission: Record<string, any>) {
  const db = await getDb();
  const entries = Object.entries(permission);
  if (!entries.length) return;
  const cols = entries.map(([k]) => k).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  const params = entries.map(([, v]) => v);
  await db.execute(
    `INSERT INTO permissions (${cols}) VALUES (${placeholders})`,
    params
  );
}

export async function permission_update(
  id: number,
  fields: Record<string, any>
) {
  const db = await getDb();
  const entries = Object.entries(fields);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);
  params.push(id);
  await db.execute(`UPDATE permissions SET ${sets} WHERE id = ?`, params);
}

export async function permission_delete(id: number) {
  const db = await getDb();
  await db.execute(
    "UPDATE permissions SET actif = 0 WHERE id = ?",
    [id]
  );
}
