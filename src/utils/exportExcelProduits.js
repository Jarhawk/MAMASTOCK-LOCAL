import { query } from '@/local/db';
import { saveAs } from "file-saver";
import { loadXLSX } from "@/lib/lazy/vendors";


// Colonnes exportées avec libellés lisibles
import { isTauri } from "@/lib/tauriEnv";const EXPORT_HEADERS = [
{ key: "nom", header: "Nom" },
{ key: "unite", header: "Unité" },
{ key: "famille", header: "Famille" },
{ key: "sous_famille", header: "Sous-famille" },
{ key: "zone_stock", header: "Zone de stockage" },
{ key: "stock", header: "Stock" },
{ key: "pmp", header: "PMP" },
{ key: "actif", header: "Actif" },
{ key: "seuil_min", header: "Seuil min" }];


// Template utilisé pour l'import de nouveaux produits
const TEMPLATE_HEADERS = [
"nom",
"famille",
"sous_famille",
"unite",
"zone_stock",
"stock_min",
"actif"];


export async function exportExcelProduits(mama_id) {
  const rowsRaw = await query(
    `SELECT p.nom,
            u.nom AS unite,
            f.nom AS famille,
            sf.nom AS sous_famille,
            z.nom AS zone_stock,
            p.stock_theorique AS stock,
            p.pmp,
            p.actif,
            p.seuil_min
     FROM produits p
     LEFT JOIN unites u ON u.id = p.unite_id
     LEFT JOIN familles f ON f.id = p.famille_id
     LEFT JOIN sous_familles sf ON sf.id = p.sous_famille_id
     LEFT JOIN inventaire_zones z ON z.id = p.zone_stock_id
     WHERE p.mama_id = ?`,
    [mama_id]
  );

  const rows = rowsRaw.map((p) => ({
    nom: p.nom,
    unite: p.unite || "",
    famille: p.famille || "",
    sous_famille: p.sous_famille || "",
    zone_stock: p.zone_stock || "",
    stock: p.stock ?? 0,
    pmp: p.pmp ?? "",
    actif: p.actif ? "TRUE" : "FALSE",
    seuil_min: p.seuil_min ?? 0
  }));

  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: EXPORT_HEADERS.map((h) => h.key)
  });
  // Remplacer la ligne d'en-tête par des libellés lisibles
  XLSX.utils.sheet_add_aoa(
    ws,
    [EXPORT_HEADERS.map((h) => h.header)],
    { origin: "A1" }
  );
  XLSX.utils.book_append_sheet(wb, ws, "Produits");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf]), "produits_export_mamastock.xlsx");
}

export async function downloadProduitsTemplate() {
  const example = Object.fromEntries(TEMPLATE_HEADERS.map((h) => [h, ""]));
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([example], { header: TEMPLATE_HEADERS });
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf]), "produits_template_mamastock.xlsx");
}