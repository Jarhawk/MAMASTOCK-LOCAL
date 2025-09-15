import { readText, saveText, existsFile } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

const FILE = "commandes.json";

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

export async function commandes_list({ mama_id, fournisseur = "", statut = "", debut = "", fin = "", limit = 20, offset = 0 }: any) {
  const list = await readAll();
  let rows = list.filter((c) => {
    if (mama_id && c.mama_id !== mama_id) return false;
    if (fournisseur && c.fournisseur_id !== fournisseur) return false;
    if (statut && c.statut !== statut) return false;
    if (debut && c.date_commande < debut) return false;
    if (fin && c.date_commande > fin) return false;
    return true;
  });
  const count = rows.length;
  rows = rows.
  sort((a, b) => (b.date_commande || "").localeCompare(a.date_commande || "")).
  slice(offset, offset + limit).
  map((c) => ({
    ...c,
    total: (c.lignes || []).reduce((s: number, l: any) => s + Number(l.total_ligne || l.quantite * l.prix_unitaire || 0), 0)
  }));
  return { data: rows, count };
}

export async function commande_get(mama_id: string, id: string) {
  const list = await readAll();
  const c = list.find((cmd) => cmd.mama_id === mama_id && cmd.id === id);
  return c || null;
}

export async function commande_insert(cmd: any) {
  const list = await readAll();
  const id = crypto.randomUUID();
  const newCmd = {
    id,
    created_at: new Date().toISOString(),
    statut: "draft",
    lignes: [],
    ...cmd
  };
  list.push(newCmd);
  await writeAll(list);
  return id;
}

export async function commande_update(id: string, fields: any) {
  const list = await readAll();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...fields };
  await writeAll(list);
}

export async function commande_delete(id: string) {
  const list = await readAll();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list.splice(idx, 1);
  await writeAll(list);
}