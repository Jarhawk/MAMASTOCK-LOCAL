import { useEffect, useState } from 'react';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/tauriEnv";

interface Famille {
  id: number;
  nom: string;
}

export default function Familles() {
  const [db, setDb] = useState<any>(null);
  const [items, setItems] = useState<Famille[]>([]);
  const [nom, setNom] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isTauri()) {
      getDb()
        .then(setDb)
        .catch(() => setError('Base de données indisponible'));
    } else {
      setError('Base de données indisponible');
    }
  }, []);

  useEffect(() => {
    if (db) reload();
  }, [db]);

  async function reload() {
    try {
      const rows = await db.select<Famille[]>(
        'SELECT id, nom FROM familles ORDER BY nom'
      );
      setItems(rows);
    } catch {
      setError('Lecture impossible');
    }
  }

  async function add() {
    if (!nom) return;
    try {
      await db.execute('INSERT INTO familles(nom) VALUES (?)', [nom]);
      setNom('');
      reload();
    } catch (e: any) {
      if (String(e).includes('UNIQUE')) {
        alert('Cette famille existe déjà');
      } else {
        alert('Erreur lors de l\'ajout');
      }
    }
  }

  async function remove(id: number) {
    try {
      await db.execute('DELETE FROM familles WHERE id = ?', [id]);
      reload();
    } catch {
      alert('Suppression impossible');
    }
  }

  if (error) return <div>{error}</div>;
  if (!db) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Familles</h1>
      <div>
        <input
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <button onClick={add}>Ajouter</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id}>
              <td>{f.nom}</td>
              <td>
                <button onClick={() => remove(f.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
