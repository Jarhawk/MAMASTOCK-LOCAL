import { existsFile, readText, saveText } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

export type Perte = {
  id: string;
  mama_id: string;
  date_perte: string;
  produit_id: string;
  quantite: number;
  [key: string]: any;
};

const FILE = "pertes.json";

async function readAll(): Promise<Perte[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Perte[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function pertes_list({
  mama_id,
  debut = null,
  fin = null




}: {mama_id: string;debut?: string | null;fin?: string | null;}): Promise<Perte[]> {
  let list = await readAll();
  if (mama_id) list = list.filter((p) => p.mama_id === mama_id);
  if (debut) list = list.filter((p) => p.date_perte >= debut);
  if (fin) list = list.filter((p) => p.date_perte <= fin);
  // ordre du plus récent au plus ancien
  list.sort((a, b) => a.date_perte < b.date_perte ? 1 : -1);
  return list;
}

export async function pertes_add(values: Omit<Perte, "id"> & {id?: string;}) {
  const list = await readAll();
  const item: Perte = {
    id: values.id || crypto.randomUUID(),
    ...values
  } as Perte;
  list.push(item);
  await writeAll(list);
  return item.id;
}

export async function pertes_update(id: string, values: Partial<Perte>) {
  const list = await readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...values };
  await writeAll(list);
}

export async function pertes_delete(id: string) {
  let list = await readAll();
  list = list.filter((p) => p.id !== id);
  await writeAll(list);
}