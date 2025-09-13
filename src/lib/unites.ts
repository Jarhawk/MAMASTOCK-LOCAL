import { isTauri, getDb } from "@/lib/sql";

export interface Unite {
  id: number;
  code: string;
  libelle: string;
}

export async function listUnites(): Promise<Unite[]> {
  if (!isTauri) return [];
  const db = await getDb();
  return db.select<Unite[]>("SELECT id, code, libelle FROM unites ORDER BY libelle;");
}

export async function createUnite(code: string, libelle: string) {
  if (!isTauri) return;
  const db = await getDb();
  await db.execute(
    "INSERT INTO unites (code, libelle) VALUES (?, ?);",
    [code, libelle]
  );
}

export async function deleteUnite(id: number) {
  if (!isTauri) return;
  const db = await getDb();
  await db.execute("DELETE FROM unites WHERE id = ?;", [id]);
}
