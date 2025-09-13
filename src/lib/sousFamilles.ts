import { getDb } from "@/lib/sql";

export interface SousFamille {
  id: number;
  famille_id: number;
  code: string;
  libelle: string;
  famille_libelle?: string;
}

export async function listSousFamilles(): Promise<SousFamille[]> {
  const db = await getDb();
  return await db.select<SousFamille[]>(
    `SELECT sf.id, sf.famille_id, sf.code, sf.libelle, f.libelle AS famille_libelle
     FROM sous_familles sf
     JOIN familles f ON f.id = sf.famille_id
     ORDER BY sf.libelle;`
  );
}

export async function createSousFamille(
  famille_id: number,
  code: string,
  libelle: string
) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO sous_familles (famille_id, code, libelle) VALUES (?, ?, ?);",
    [famille_id, code, libelle]
  );
}

export async function updateSousFamille(
  id: number,
  famille_id: number,
  code: string,
  libelle: string
) {
  const db = await getDb();
  await db.execute(
    "UPDATE sous_familles SET famille_id = ?, code = ?, libelle = ? WHERE id = ?;",
    [famille_id, code, libelle, id]
  );
}

export async function deleteSousFamille(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM sous_familles WHERE id = ?;", [id]);
}
