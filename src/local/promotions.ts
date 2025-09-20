// @ts-nocheck
import { isTauri } from "@/lib/tauriEnv";
import { existsFile, readText, saveText } from "@/local/files";
const FILE = "promotions.json";

export type Promotion = {
  id: string;
  mama_id: string;
  nom: string;
  date_debut?: string;
  actif?: boolean;
  [key: string]: any;
};

async function readAll(): Promise<Promotion[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Promotion[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function promotions_list({
  mama_id,
  search = "",
  actif = null,
  page = 1,
  limit = 20






}: {mama_id: string;search?: string;actif?: boolean | null;page?: number;limit?: number;}) {
  let list = await readAll();
  if (mama_id) list = list.filter((p) => p.mama_id === mama_id);
  if (search) list = list.filter((p) => p.nom?.toLowerCase().includes(search.toLowerCase()));
  if (typeof actif === "boolean") list = list.filter((p) => !!p.actif === actif);
  const total = list.length;
  const start = (page - 1) * limit;
  return { data: list.slice(start, start + limit), total };
}

export async function promotions_add(values: Promotion) {
  const list = await readAll();
  const item: Promotion = {
    id: crypto.randomUUID(),
    actif: true,
    ...values
  };
  list.push(item);
  await writeAll(list);
  return item.id;
}

export async function promotions_update(id: string, values: Partial<Promotion>) {
  const list = await readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...values };
  await writeAll(list);
}

export async function promotions_delete(id: string) {
  await promotions_update(id, { actif: false });
}