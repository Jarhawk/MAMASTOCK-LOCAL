import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export type SousFamille = {
  id: number;
  famille_id: number;
  code: string;
  libelle: string;
};

export async function listSousFamilles(): Promise<SousFamille[]> {
  const db = await getDb();
  return await db.select(
    "SELECT id, famille_id, code, libelle FROM sous_familles ORDER BY libelle"
  );
}

export async function createSousFamille({
  famille_id,
  code,
  libelle




}: {famille_id: number;code: string;libelle: string;}): Promise<SousFamille> {
  const db = await getDb();
  const rows: SousFamille[] = await db.select(
    "INSERT INTO sous_familles(famille_id, code, libelle) VALUES (?,?,?) RETURNING *",
    [famille_id, code, libelle]
  );
  return rows[0];
}

export async function updateSousFamille(
id: number,
{ famille_id, code, libelle }: {famille_id: number;code: string;libelle: string;})
: Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE sous_familles SET famille_id=?, code=?, libelle=? WHERE id=?",
    [famille_id, code, libelle, id]
  );
}

export async function deleteSousFamille(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM sous_familles WHERE id=?", [id]);
}