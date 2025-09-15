import { readText, saveText, existsFile } from "./files";import { isTauri } from "@/lib/db/sql";

const FILE = "stats/budget_mensuel.json";

async function readAll() {
  if (!(await existsFile(FILE))) return {} as Record<string, {cible: number;reel: number;}>;
  try {
    return JSON.parse(await readText(FILE)) as Record<string, {cible: number;reel: number;}>;
  } catch {
    return {} as Record<string, {cible: number;reel: number;}>;
  }
}

async function writeAll(data: Record<string, {cible: number;reel: number;}>) {
  await saveText(FILE, JSON.stringify(data, null, 2));
}

export async function budgetMensuelGet(periode: string) {
  const all = await readAll();
  return all[periode] || { cible: 0, reel: 0 };
}

export async function budgetMensuelSet(periode: string, cible: number, reel: number) {
  const all = await readAll();
  all[periode] = { cible, reel };
  await writeAll(all);
}