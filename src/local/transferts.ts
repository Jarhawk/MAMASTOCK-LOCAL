import { existsFile, readText, saveText } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

const FILE = "transferts.json";

export type TransfertLigne = {
  produit_id: string;
  quantite: number;
  commentaire?: string;
  [key: string]: any;
};

export type Transfert = {
  id: string;
  mama_id: string;
  date_transfert: string;
  zone_source_id: string;
  zone_dest_id: string;
  motif?: string;
  commentaire?: string;
  utilisateur_id?: string;
  created_at: string;
  lignes: TransfertLigne[];
};

async function readAll(): Promise<Transfert[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Transfert[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function transferts_list({
  mama_id,
  debut,
  fin,
  zone_source_id,
  zone_dest_id,
  produit_id







}: {mama_id?: string;debut?: string;fin?: string;zone_source_id?: string | number;zone_dest_id?: string | number;produit_id?: string | number;} = {}): Promise<Transfert[]> {
  let list = await readAll();
  if (mama_id) list = list.filter((t) => t.mama_id === mama_id);
  if (debut) list = list.filter((t) => t.date_transfert >= debut);
  if (fin) list = list.filter((t) => t.date_transfert <= fin);
  if (zone_source_id) list = list.filter((t) => String(t.zone_source_id) === String(zone_source_id));
  if (zone_dest_id) list = list.filter((t) => String(t.zone_dest_id) === String(zone_dest_id));
  if (produit_id) list = list.filter((t) => t.lignes.some((l) => String(l.produit_id) === String(produit_id)));
  list.sort((a, b) => b.date_transfert.localeCompare(a.date_transfert));
  return list;
}

export async function transfert_get(id: string, mama_id?: string) {
  const list = await readAll();
  return list.find((t) => t.id === id && (!mama_id || t.mama_id === mama_id)) || null;
}

export async function transfert_create(
header: Omit<Transfert, "id" | "created_at" | "lignes">,
lignes: TransfertLigne[] = [])
: Promise<Transfert> {
  const list = await readAll();
  const item: Transfert = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...header,
    lignes: lignes.map((l) => ({
      ...l,
      quantite: Number(l.quantite)
    }))
  };
  list.push(item);
  await writeAll(list);
  return item;
}

export async function transfert_delete(id: string, mama_id?: string) {
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === id && (!mama_id || t.mama_id === mama_id));
  if (idx === -1) return;
  list.splice(idx, 1);
  await writeAll(list);
}