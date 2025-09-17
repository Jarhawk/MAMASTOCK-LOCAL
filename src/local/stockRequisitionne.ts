import { isTauri } from "@/lib/tauriEnv";
import { readText, existsFile } from "@/local/files";
const FILE = "stock_requisitionne.json";

async function readAll() {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function stock_requisitionne_list(mama_id: string) {
  const list = await readAll();
  return list.filter((s: any) => !mama_id || s.mama_id === mama_id);
}