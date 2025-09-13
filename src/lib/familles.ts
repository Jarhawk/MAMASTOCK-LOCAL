import { getDb } from "@/lib/sql";

export interface Famille {
  id: number;
  code: string;
  libelle: string;
}

export async function listFamilles(): Promise<Famille[]> {
  const db = await getDb();
  return await db.select<Famille[]>(
    "SELECT id, code, libelle FROM familles ORDER BY libelle;"
  );
}

export async function createFamille(code: string, libelle: string) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO familles (code, libelle) VALUES (?, ?);",
    [code.trim(), libelle.trim()]
  );
}

export async function updateFamille(id: number, code: string, libelle: string) {
  const db = await getDb();
  await db.execute(
    "UPDATE familles SET code = ?, libelle = ? WHERE id = ?;",
    [code, libelle, id]
  );
}

export async function deleteFamille(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM familles WHERE id = ?;", [id]);
}
