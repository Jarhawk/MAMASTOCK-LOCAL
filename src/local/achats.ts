import { isTauri } from "@/lib/tauriEnv";
import { readText, saveText, existsFile } from "@/local/files";
const FILE = "achats.json";

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

export async function achats_list({
  mama_id,
  fournisseur = "",
  produit = "",
  debut = "",
  fin = "",
  actif = true,
  offset = 0,
  limit = 50
}: any) {
  const list = await readAll();
  let rows = list.filter((a) => {
    if (mama_id && a.mama_id !== mama_id) return false;
    if (fournisseur && a.fournisseur_id !== fournisseur) return false;
    if (produit && a.produit_id !== produit) return false;
    if (typeof actif === "boolean" && a.actif !== actif) return false;
    if (debut && a.date_achat < debut) return false;
    if (fin && a.date_achat > fin) return false;
    return true;
  });
  const count = rows.length;
  rows = rows.
  sort((a, b) => (b.date_achat || "").localeCompare(a.date_achat || "")).
  slice(offset, offset + limit);
  return { data: rows, count };
}

export async function achat_get(mama_id: string, id: string) {
  const list = await readAll();
  const a = list.find((ac) => ac.mama_id === mama_id && ac.id === id);
  return a || null;
}

export async function achat_insert(achat: any) {
  const list = await readAll();
  const id = crypto.randomUUID();
  const newAchat = {
    id,
    created_at: new Date().toISOString(),
    actif: true,
    ...achat
  };
  list.push(newAchat);
  await writeAll(list);
  return id;
}

export async function achat_update(id: string, fields: any) {
  const list = await readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...fields };
  await writeAll(list);
}

export async function achat_delete(id: string) {
  await achat_update(id, { actif: false });
}