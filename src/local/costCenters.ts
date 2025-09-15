import { readText, saveText, existsFile } from "@/local/files";import { isTauri } from "@/lib/db/sql";

const FILE_PATH = "config/cost_centers.json";

export type CostCenter = {
  id: string;
  nom: string;
  actif: boolean;
};

export async function readCostCenters(): Promise<CostCenter[]> {
  if (!(await existsFile(FILE_PATH))) return [];
  try {
    const txt = await readText(FILE_PATH);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function writeCostCenters(list: CostCenter[]) {
  await saveText(FILE_PATH, JSON.stringify(list, null, 2));
}