import { getDb } from "@/lib/sql";

export async function listSousFamilles() {
  const db = await getDb();
  return await db.select(
    `SELECT sf.id, sf.code, sf.libelle, sf.famille_id, f.libelle as famille
     FROM sous_familles sf
     LEFT JOIN familles f ON f.id = sf.famille_id
     ORDER BY sf.libelle;`
  );
}

export async function createSousFamille(code: string, libelle: string, famille_id: number) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO sous_familles (code, libelle, famille_id) VALUES (?, ?, ?);",
    [code.trim(), libelle.trim(), famille_id]
  );
}

export async function deleteSousFamille(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM sous_familles WHERE id = ?;", [id]);
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
