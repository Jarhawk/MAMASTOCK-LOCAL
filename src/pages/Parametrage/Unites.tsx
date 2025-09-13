import { useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';

interface Unite {
  id: number;
  code: string;
  libelle: string;
}

export default function Unites() {
  const [db, setDb] = useState<any>(null);
  const [items, setItems] = useState<Unite[]>([]);
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Database.load('sqlite:mamastock.db')
      .then(setDb)
      .catch(() => setError('Base de données indisponible'));
  }, []);

  useEffect(() => {
    if (db) reload();
  }, [db]);

  async function reload() {
    try {
      const rows = await db.select<Unite[]>(
        'SELECT id, code, libelle FROM unites ORDER BY libelle'
      );
      setItems(rows);
    } catch (e) {
      setError('Lecture impossible');
    }
  }

  async function add() {
    if (!code || !libelle) return;
    try {
      await db.execute('INSERT INTO unites(code, libelle) VALUES (?, ?)', [
        code,
        libelle,
      ]);
      setCode('');
      setLibelle('');
      reload();
    } catch (e: any) {
      if (String(e).includes('UNIQUE')) {
        alert('Ce code existe déjà');
      } else {
        alert('Erreur lors de l\'ajout');
      }
    }
  }

  async function remove(id: number) {
    try {
      await db.execute('DELETE FROM unites WHERE id = ?', [id]);
      reload();
    } catch {
      alert('Suppression impossible');
    }
  }

  if (error) return <div>{error}</div>;
  if (!db) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Unités</h1>
      <div>
        <input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          placeholder="Libellé"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />
        <button onClick={add}>Ajouter</button>
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
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.code}</td>
              <td>{u.libelle}</td>
              <td>
                <button onClick={() => remove(u.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
