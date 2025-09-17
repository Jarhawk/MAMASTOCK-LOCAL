import { isTauri } from "@/lib/tauriEnv";
import { readText, saveText, existsFile } from "@/local/files";
const FILE = "signalements.json";

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

export async function signalements_list({ mama_id }: {mama_id: string;}) {
  const list = await readAll();
  return list.filter((s) => !mama_id || s.mama_id === mama_id);
}

export async function signalement_insert(sig: any) {
  const list = await readAll();
  const entry = { id: crypto.randomUUID(), ...sig };
  list.push(entry);
  await writeAll(list);
  return entry.id;
}

export async function signalement_get(mama_id: string, id: string) {
  const list = await readAll();
  return (
    list.find((s) => s.id === id && (!mama_id || s.mama_id === mama_id)) || null);

}