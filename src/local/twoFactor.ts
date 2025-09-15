import { readText, saveText, existsFile } from "@/local/files";import { isTauri } from "@/lib/db/sql";

const FILE = "twofactor.json";

type Entry = {secret: string | null;enabled: boolean;};

type Store = Record<string, Entry>;

async function readAll(): Promise<Store> {
  if (await existsFile(FILE)) {
    try {
      return JSON.parse(await readText(FILE));
    } catch {}
  }
  return {};
}

async function writeAll(store: Store) {
  await saveText(FILE, JSON.stringify(store, null, 2));
}

export async function getTwoFactor(id: string): Promise<Entry> {
  const store = await readAll();
  return store[id] || { secret: null, enabled: false };
}

export async function setTwoFactor(id: string, entry: Entry) {
  const store = await readAll();
  store[id] = entry;
  await writeAll(store);
}

export async function deleteTwoFactor(id: string) {
  const store = await readAll();
  delete store[id];
  await writeAll(store);
}