import { existsFile, readText, saveText } from "@/local/files";import { isTauri } from "@/lib/db/sql";

const FILE = "menu_groupes.json";

type MenuGroupe = {
  id: string;
  nom: string;
  lignes?: any[];
  [key: string]: any;
};

async function readAll(): Promise<MenuGroupe[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: MenuGroupe[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function menuGroupes_list({ q = "" } = {}) {
  let list = await readAll();
  if (q) list = list.filter((g) => g.nom?.toLowerCase().includes(q.toLowerCase()));
  return list;
}

export async function menuGroupes_addLigne(menuGroupeId: string, ligne: any) {
  const list = await readAll();
  const grp = list.find((g) => g.id === menuGroupeId);
  if (!grp) throw new Error("Menu groupe introuvable");
  if (!Array.isArray(grp.lignes)) grp.lignes = [];
  grp.lignes.push({ id: crypto.randomUUID(), ...ligne });
  await writeAll(list);
}