import { useEffect, useState } from 'react';

import { isTauri } from "@/lib/tauriEnv";
import { listUnites, createUnite, deleteUnite } from '@/lib/unites';
export default function Unites() {
  const [rows, setRows] = useState([]);
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setRows(await listUnites());
    } catch {
      setError('Lecture impossible');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd() {
    if (!code || !libelle) return;
    try {
      await createUnite(code, libelle);
      setCode('');
      setLibelle('');
      refresh();
    } catch (e: any) {
      if (String(e).includes('UNIQUE')) {
        alert('Ce code existe déjà');
      } else {
        alert("Erreur lors de l'ajout");
      }
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteUnite(id);
      refresh();
    } catch {
      alert('Suppression impossible');
    }
  }

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Unités</h1>
      <div>
        <input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)} />
        
        <input
          placeholder="Libellé"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)} />
        
        <button onClick={onAdd}>Ajouter</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Libellé</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u: any) =>
          <tr key={u.id}>
              <td>{u.code}</td>
              <td>{u.libelle}</td>
              <td>
                <button onClick={() => onDelete(u.id)}>Supprimer</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}