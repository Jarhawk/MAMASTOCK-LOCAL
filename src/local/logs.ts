import { isTauri } from "@/lib/tauriEnv";
import { readText, saveText, existsFile } from "@/local/files";
const LOGS_FILE = "logs.json";
const RAPPORTS_FILE = "rapports_generes.json";

async function readArray(file: string) {
  if (!(await existsFile(file))) return [] as any[];
  try {
    const txt = await readText(file);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeArray(file: string, list: any[]) {
  await saveText(file, JSON.stringify(list, null, 2));
}

export async function logs_list(mama_id: string, _filters: any = {}) {
  const list = await readArray(LOGS_FILE);
  return list.filter((l) => mama_id ? l.mama_id === mama_id : true);
}

export async function logs_add(entry: any) {
  const list = await readArray(LOGS_FILE);
  const row = { id: crypto.randomUUID(), date_log: new Date().toISOString(), ...entry };
  list.push(row);
  await writeArray(LOGS_FILE, list);
  return row;
}

export async function rapports_list(mama_id: string) {
  const list = await readArray(RAPPORTS_FILE);
  return list.filter((r) => mama_id ? r.mama_id === mama_id : true);
}