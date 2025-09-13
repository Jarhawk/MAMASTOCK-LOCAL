import { getDb } from "@/lib/db/sql";

export type Unite = {
  id: number;
  code: string;
  libelle: string;
  created_at?: string;
};

export async function listUnites(): Promise<Unite[]> {
  const db = await getDb();
  return await db.select(
    "SELECT id, code, libelle, created_at FROM unites ORDER BY libelle"
  );
}

export async function createUnite({
  code,
  libelle,
}: {
  code: string;
  libelle: string;
}): Promise<Unite> {
  const db = await getDb();
  const rows: Unite[] = await db.select(
    "INSERT INTO unites(code, libelle) VALUES (?, ?) RETURNING *",
    [code, libelle]
  );
  return rows[0];
}

export async function updateUnite(
  id: number,
  { code, libelle }: { code: string; libelle: string }
): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE unites SET code=?, libelle=? WHERE id=?", [
    code,
    libelle,
    id,
  ]);
}

export async function deleteUnite(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM unites WHERE id=?", [id]);
}

