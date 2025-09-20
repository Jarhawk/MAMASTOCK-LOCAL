// @ts-nocheck
import { isTauri } from "@/lib/tauriEnv";
import { existsFile, readText, saveText } from "@/local/files";
const FILE = "templates_commandes.json";

export type TemplateCommande = {
  id: string;
  mama_id: string;
  nom: string;
  fournisseur_id?: string;
  actif?: boolean;
  [key: string]: any;
};

async function readAll(): Promise<TemplateCommande[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: TemplateCommande[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function templates_commandes_list({
  mama_id,
  fournisseur_id,
  actif




}: {mama_id?: string;fournisseur_id?: string;actif?: boolean;} = {}) {
  let list = await readAll();
  if (mama_id) list = list.filter((t) => t.mama_id === mama_id);
  if (fournisseur_id) list = list.filter((t) => t.fournisseur_id === fournisseur_id);
  if (typeof actif === "boolean") list = list.filter((t) => !!t.actif === actif);
  list.sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
  return list;
}

export async function templates_commandes_get(id: string, mama_id: string) {
  const list = await templates_commandes_list({ mama_id });
  return list.find((t) => t.id === id) || null;
}

export async function templates_commandes_create(values: TemplateCommande) {
  const list = await readAll();
  const item: TemplateCommande = {
    id: crypto.randomUUID(),
    actif: true,
    ...values
  };
  list.push(item);
  await writeAll(list);
  return item;
}

export async function templates_commandes_update(
id: string,
mama_id: string,
values: Partial<TemplateCommande>)
{
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === id && t.mama_id === mama_id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...values };
  await writeAll(list);
  return list[idx];
}

export async function templates_commandes_delete(id: string, mama_id: string) {
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === id && t.mama_id === mama_id);
  if (idx === -1) return;
  list.splice(idx, 1);
  await writeAll(list);
}

export async function templates_commandes_get_for_fournisseur(
mama_id: string,
fournisseur_id: string)
{
  const list = await templates_commandes_list({ mama_id, fournisseur_id, actif: true });
  return list[0] || null;
}