import { readText, saveText, existsFile } from "@/local/files";import { isTauri } from "@/lib/db/sql";

const FILE = "bons_livraison.json";

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

export async function bonsLivraison_list({ mama_id, fournisseur = "", debut = "", fin = "", actif = true }: any) {
  const list = await readAll();
  return list.filter((b) => {
    if (mama_id && b.mama_id !== mama_id) return false;
    if (fournisseur && b.fournisseur_id !== fournisseur) return false;
    if (actif !== null && b.actif !== actif) return false;
    if (debut && b.date_reception < debut) return false;
    if (fin && b.date_reception > fin) return false;
    return true;
  });
}

export async function bonLivraison_get(mama_id: string, id: string) {
  const list = await readAll();
  return list.find((b) => b.mama_id === mama_id && b.id === id) || null;
}

export async function bonLivraison_insert(bl: any) {
  const list = await readAll();
  const id = crypto.randomUUID();
  const newBl = {
    id,
    numero_bl: "",
    date_reception: new Date().toISOString().slice(0, 10),
    actif: true,
    fournisseur_id: null,
    mama_id: bl.mama_id,
    created_at: new Date().toISOString(),
    lignes: [],
    ...bl
  };
  list.push(newBl);
  await writeAll(list);
  return id;
}

export async function bonLivraison_update(id: string, fields: any) {
  const list = await readAll();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...fields };
  await writeAll(list);
}