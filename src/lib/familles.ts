import { getDb } from "@/lib/db/database";import { isTauri } from "@/lib/tauriEnv";

export type Famille = {
  id: number;
  code: string;
  libelle: string;
  created_at?: string;
};

export async function listFamilles(): Promise<Famille[]> {
  const db = await getDb();
  return await db.select(
    "SELECT id, code, libelle, created_at FROM familles ORDER BY libelle"
  );
}

export async function createFamille({
  code,
  libelle



}: {code: string;libelle: string;}): Promise<Famille> {
  const db = await getDb();
  const rows: Famille[] = await db.select(
    "INSERT INTO familles(code, libelle) VALUES (?, ?) RETURNING *",
    [code, libelle]
  );
  return rows[0];
}

export async function updateFamille(
id: number,
{ code, libelle }: {code: string;libelle: string;})
: Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE familles SET code=?, libelle=? WHERE id=?", [
  code,
  libelle,
  id]
  );
}

export async function deleteFamille(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM familles WHERE id=?", [id]);
}