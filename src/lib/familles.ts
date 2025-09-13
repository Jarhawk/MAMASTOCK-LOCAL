import { selectAll, selectOne, exec } from "@/lib/db/sql";
export type Famille = { id:number; nom:string; actif:number };

export async function listFamilles(): Promise<Famille[]> {
  return await selectAll<Famille>("SELECT id, nom, actif FROM familles ORDER BY nom ASC");
}
export async function createFamille(nom:string){ await exec("INSERT INTO familles(nom, actif) VALUES(?,1)", [nom.trim()]); }
export async function renameFamille(id:number, nom:string){ await exec("UPDATE familles SET nom=? WHERE id=?", [nom.trim(), id]); }
export async function setFamilleActif(id:number, actif:boolean){ await exec("UPDATE familles SET actif=? WHERE id=?", [actif?1:0, id]); }
export async function deleteFamille(id:number){ await exec("DELETE FROM familles WHERE id=?", [id]); }
