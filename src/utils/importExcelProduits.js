import { query, getDb } from '@/local/db';
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

import { fetchFamillesForValidation } from "@/hooks/useFamilles";
import { listUnitesForValidation } from "@/hooks/useUnites";
import { fetchZonesStock } from "@/hooks/useZonesStock";import { isTauri } from "@/lib/tauriEnv";

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  const str = String(value).toLowerCase().trim();
  if (["true", "vrai", "1", "yes", "oui"].includes(str)) return true;
  if (["false", "faux", "0", "no", "non"].includes(str)) return false;
  return false;
}

export function validateProduitRow(row, maps) {
  const errors = {};
  if (!row.nom) errors.nom = "nom manquant";

  const famId = maps.familles.get((row.famille_nom || "").toLowerCase());
  if (!famId) errors.famille_nom = "famille inconnue";

  const sfName = (row.sous_famille_nom || "").toLowerCase();
  const sfId = sfName ? maps.sousFamilles.get(sfName) : null;
  if (row.sous_famille_nom && !sfId) errors.sous_famille_nom = "sous_famille inconnue";

  const uniteId = maps.unites.get((row.unite_nom || "").toLowerCase());
  if (!uniteId) errors.unite_nom = "unite inconnue";

  const zoneId = maps.zones.get((row.zone_stock_nom || "").toLowerCase());
  if (!zoneId) errors.zone_stock_nom = "zone_stock inconnue";

  if (row.fournisseur_id && !maps.fournisseurs.has(String(row.fournisseur_id)))
  errors.fournisseur_id = "fournisseur inconnu";

  const status = Object.keys(errors).length ? "error" : "ok";

  return {
    ...row,
    famille_id: famId || null,
    sous_famille_id: sfId || null,
    unite_id: uniteId || null,
    zone_stock_id: zoneId || null,
    errors,
    status
  };
}

export async function parseProduitsFile(file, mama_id) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const [
  famillesRes,
  sousFamillesRes,
  unitesRes,
  zonesRes,
  fournisseursRes,
  produitsRes] =
  await Promise.all([
  fetchFamillesForValidation(mama_id),
  query("SELECT id, nom FROM sous_familles WHERE mama_id = ?", [mama_id]),
  listUnitesForValidation(mama_id),
  fetchZonesStock(mama_id),
  query("SELECT id FROM fournisseurs WHERE mama_id = ?", [mama_id]),
  query("SELECT nom FROM produits WHERE mama_id = ?", [mama_id])]
  );

  const mapByName = (res) =>
  new Map(((res?.data ?? res) || []).map((x) => [x.nom.toLowerCase(), x.id]));
  const famillesMap = mapByName(famillesRes);
  const sousFamillesMap = mapByName(sousFamillesRes);
  const unitesMap = mapByName(unitesRes);
  const zonesMap = mapByName(zonesRes);
  const fournisseurIds = new Set(
    fournisseursRes.map((f) => String(f.id))
  );

  const existingNames = new Set(
    produitsRes.map((p) => p.nom.toLowerCase())
  );

  const maps = {
    familles: famillesMap,
    sousFamilles: sousFamillesMap,
    unites: unitesMap,
    zones: zonesMap,
    fournisseurs: fournisseurIds
  };

  const seenNames = new Set();

  const rows = raw.map((r) => {
    const n = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [
      k.toLowerCase().trim(),
      typeof v === "string" ? v.trim() : v]
      )
    );

    const baseRow = {
      id: uuidv4(),
      nom: String(n.nom || "").trim(),
      famille_nom: String(n.famille || "").trim(),
      sous_famille_nom: String(n.sous_famille || "").trim(),
      unite_nom: String(n.unite || "").trim(),
      zone_stock_nom: String(n.zone_stock || "").trim(),
      code: String(n.code || "").trim(),
      allergenes: String(n.allergenes || "").trim(),
      actif: parseBoolean(n.actif),
      pmp: n.pmp !== "" ? Number(n.pmp) : null,
      stock_theorique:
      n.stock_theorique !== "" ? Number(n.stock_theorique) : null,
      stock_min: n.stock_min !== "" ? Number(n.stock_min) : null,
      dernier_prix: n.dernier_prix !== "" ? Number(n.dernier_prix) : null,
      fournisseur_id: String(n.fournisseur_id || "").trim() || null,
      mama_id
    };

    let validated = validateProduitRow(baseRow, maps);
    const lowerName = validated.nom.toLowerCase();
    if (existingNames.has(lowerName) || seenNames.has(lowerName)) {
      validated.errors.nom = validated.errors.nom ?
      `${validated.errors.nom}, déjà existant` :
      "produit déjà existant";
      validated.status = "error";
    }
    seenNames.add(lowerName);
    return validated;
  });

  return {
    rows,
    maps,
    familles: famillesRes.data || [],
    sousFamilles: sousFamillesRes.data || [],
    unites: unitesRes.data || [],
    zones: zonesRes.data || []
  };
}

export async function insertProduits(rows) {
  const db = await getDb();
  const results = [];
  for (const r of rows) {
    const {
      errors: _e,
      status: _s,
      famille_nom: _fa,
      sous_famille_nom: _sf,
      unite_nom: _u,
      zone_stock_nom: _z,
      ...payload
    } = r;
    payload.seuil_min = payload.stock_min;
    delete payload.stock_min;
    try {
      await db.execute(
        `INSERT INTO produits
        (nom, unite_id, famille_id, zone_stock_id, stock_min, actif, sous_famille_id, code, allergenes, pmp, stock_theorique, dernier_prix, fournisseur_id, mama_id, seuil_min)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
        payload.nom,
        payload.unite_id,
        payload.famille_id,
        payload.zone_stock_id,
        payload.stock_min ?? 0,
        payload.actif ? 1 : 0,
        payload.sous_famille_id ?? null,
        payload.code ?? null,
        payload.allergenes ?? null,
        payload.pmp ?? null,
        payload.stock_theorique ?? null,
        payload.dernier_prix ?? null,
        payload.fournisseur_id ?? null,
        payload.mama_id,
        payload.seuil_min ?? null]

      );
      const [{ id }] = await db.select('SELECT last_insert_rowid() as id');
      results.push({ ...r, id, insertError: null });
    } catch (err) {
      results.push({ ...r, insertError: err.message });
    }
  }
  return results;
}