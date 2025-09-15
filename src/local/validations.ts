import { existsFile, readText, saveText } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

const FILE = "validation_requests.json";

export type ValidationRequest = {
  id: string;
  mama_id: string;
  requested_by: string;
  status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  actif?: boolean;
  created_at: string;
  [k: string]: any;
};

async function readAll(): Promise<ValidationRequest[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: ValidationRequest[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function validation_requests_list(mama_id: string) {
  const list = await readAll();
  return list.
  filter((r) => r.mama_id === mama_id && r.actif !== false).
  sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function validation_requests_add(values: Omit<ValidationRequest, "id" | "created_at">) {
  const list = await readAll();
  const item: ValidationRequest = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...values
  };
  list.push(item);
  await writeAll(list);
  return item.id;
}

export async function validation_requests_update(id: string, values: Partial<ValidationRequest>) {
  const list = await readAll();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...values };
  await writeAll(list);
}