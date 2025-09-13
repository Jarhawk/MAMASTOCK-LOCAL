import { getDb, selectAll, selectOne, exec } from "@/lib/db/sql";

export type Unite = { id:number; nom:string; abbr?:string|null; actif:number };

export async function listUnites(): Promise<Unite[]> {
  return await selectAll<Unite>("SELECT id, nom, abbr, actif FROM unites ORDER BY nom ASC");
}
export async function getUnite(id:number): Promise<Unite|null> {
  return await selectOne<Unite>("SELECT id, nom, abbr, actif FROM unites WHERE id = ?", [id]);
}
export async function createUnite(nom:string, abbr?:string|null){
  await exec("INSERT INTO unites(nom, abbr, actif) VALUES(?, ?, 1)", [nom.trim(), abbr ?? null]);
}
export async function updateUnite(id:number, nom:string, abbr?:string|null, actif:boolean=true){
  await exec("UPDATE unites SET nom=?, abbr=?, actif=? WHERE id=?", [nom.trim(), abbr ?? null, actif?1:0, id]);
}
export async function deleteUnite(id:number){
  await exec("DELETE FROM unites WHERE id=?", [id]);
}
