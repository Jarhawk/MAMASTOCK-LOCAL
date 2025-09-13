import { getDb } from "@/lib/sql";

export interface Unite {
  id: number;
  code: string;
  libelle: string;
}

export async function listUnites(): Promise<Unite[]> {
  const db = await getDb();
  return db.select<Unite[]>(
    "SELECT id, code, libelle FROM unites ORDER BY libelle;"
  );
}

export async function createUnite(code: string, libelle: string) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO unites (code, libelle) VALUES (?, ?);",
    [code.trim(), libelle.trim()]
  );
}

export async function deleteUnite(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM unites WHERE id = ?;", [id]);
}
