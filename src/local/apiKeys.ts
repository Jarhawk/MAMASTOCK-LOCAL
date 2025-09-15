import { existsFile, readText, saveText } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

export type ApiKey = {
  id: string;
  name: string;
  scopes?: string[];
  role?: string;
  expiration?: string | null;
  mama_id: string;
  user_id?: string;
  created_at: string;
  revoked?: boolean;
};

const FILE = "api_keys.json";

async function readAll(): Promise<ApiKey[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: ApiKey[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function api_keys_list(mama_id: string) {
  const list = await readAll();
  return list.
  filter((k) => k.mama_id === mama_id).
  sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function api_keys_create(values: Omit<ApiKey, "id" | "created_at" | "revoked">) {
  const list = await readAll();
  const item: ApiKey = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    revoked: false,
    ...values
  };
  list.unshift(item);
  await writeAll(list);
  return item;
}

export async function api_keys_revoke(mama_id: string, id: string) {
  const list = await readAll();
  const idx = list.findIndex((k) => k.id === id && k.mama_id === mama_id);
  if (idx === -1) return;
  list[idx].revoked = true;
  await writeAll(list);
}