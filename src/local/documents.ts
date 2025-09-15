import { existsFile, readText, saveText } from "./files";import { isTauri } from "@/lib/runtime/isTauri";

const FILE = "documents.json";

async function readAll(): Promise<any[]> {
  if (!(await existsFile(FILE))) return [];
  const txt = await readText(FILE);
  try {
    return JSON.parse(txt);
  } catch {
    return [];
  }
}

async function writeAll(list: any[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function documents_list(filters: any = {}) {
  const docs = await readAll();
  const term = (filters.search || "").toLowerCase();
  return docs.filter((d) => {
    if (filters.mama_id && d.mama_id !== filters.mama_id) return false;
    if (filters.entite_liee_type && d.entite_liee_type !== filters.entite_liee_type) return false;
    if (filters.entite_liee_id && d.entite_liee_id !== filters.entite_liee_id) return false;
    if (filters.categorie && d.categorie !== filters.categorie) return false;
    if (filters.type && d.type !== filters.type) return false;
    if (term) {
      const s = `${d.nom || ""} ${d.titre || ""}`.toLowerCase();
      if (!s.includes(term)) return false;
    }
    return true;
  });
}

export async function document_add(doc: any) {
  const docs = await readAll();
  docs.unshift(doc);
  await writeAll(docs);
  return doc;
}

export async function document_get(id: string) {
  const docs = await readAll();
  return docs.find((d) => d.id === id) || null;
}

export async function document_delete(id: string) {
  const docs = await readAll();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx >= 0) {
    const [removed] = docs.splice(idx, 1);
    await writeAll(docs);
    return removed;
  }
  return null;
}