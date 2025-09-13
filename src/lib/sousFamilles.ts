import { selectAll, exec } from "@/lib/db/sql";
export type SousFamille = { id:number; famille_id:number; nom:string; actif:number };

export async function listSousFamilles(): Promise<SousFamille[]> {
  return await selectAll<SousFamille>(`
    SELECT sf.id, sf.famille_id, sf.nom, sf.actif
    FROM sous_familles sf
    JOIN familles f ON f.id = sf.famille_id
    ORDER BY f.nom ASC, sf.nom ASC
  `);
}
export async function createSousFamille(familleId:number, nom:string){
  await exec("INSERT INTO sous_familles(famille_id, nom, actif) VALUES(?,?,1)", [familleId, nom.trim()]);
}
export async function renameSousFamille(id:number, nom:string){
  await exec("UPDATE sous_familles SET nom=? WHERE id=?", [nom.trim(), id]);
}
export async function setSousFamilleActif(id:number, actif:boolean){
  await exec("UPDATE sous_familles SET actif=? WHERE id=?", [actif?1:0, id]);
}
export async function deleteSousFamille(id:number){
  await exec("DELETE FROM sous_familles WHERE id=?", [id]);
}
