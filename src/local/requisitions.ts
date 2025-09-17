import { isTauri } from "@/lib/tauriEnv";
import { readText, saveText, existsFile } from "@/local/files";
const FILE = "requisitions.json";

async function readAll(): Promise<any[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: any[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function requisitions_list({ mama_id, search = "", zone = "", statut = "", debut = "", fin = "", produit = "", page = 1, limit = 20 } = {}) {
  const list = await readAll();
  let rows = list.filter((r) => {
    if (mama_id && r.mama_id !== mama_id) return false;
    if (zone && r.zone_id !== zone) return false;
    if (statut && r.statut !== statut) return false;
    if (debut && r.date_requisition < debut) return false;
    if (fin && r.date_requisition > fin) return false;
    if (produit && !(r.lignes || []).some((l) => l.produit_id === produit)) return false;
    if (search && !(r.commentaire || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const count = rows.length;
  rows = rows.
  sort((a, b) => (b.date_requisition || "").localeCompare(a.date_requisition || "")).
  slice((page - 1) * limit, page * limit);
  return { data: rows, count };
}

export async function requisition_get(mama_id: string, id: string) {
  const list = await readAll();
  const r = list.find((x) => x.id === id && (!mama_id || x.mama_id === mama_id));
  return r || null;
}

export async function requisition_create(requisition: any) {
  const list = await readAll();
  const id = crypto.randomUUID();
  const lignes = (requisition.lignes || []).map((l: any) => ({ id: crypto.randomUUID(), ...l }));
  const row = { id, created_at: new Date().toISOString(), ...requisition, lignes };
  list.push(row);
  await writeAll(list);
  return { id };
}

export async function requisition_update(id: string, fields: any) {
  const list = await readAll();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...fields };
  await writeAll(list);
}

export async function requisition_delete(id: string) {
  const list = await readAll();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return;
  list.splice(idx, 1);
  await writeAll(list);
}