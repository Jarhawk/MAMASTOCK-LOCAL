import { useEffect, useState } from 'react';
import { getDb, isTauri } from '@/lib/db/sql';

interface Famille { id: number; nom: string; }
interface SousFamille { id: number; nom: string; famille_id: number; famille: string; }

export default function SousFamilles() {
  const [db, setDb] = useState<any>(null);
  const [items, setItems] = useState<SousFamille[]>([]);
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [familleId, setFamilleId] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTauri) {
      setError('Base de données indisponible');
      return;
    }
    getDb()
      .then(setDb)
      .catch(() => setError('Base de données indisponible'));
  }, []);

  useEffect(() => {
    if (db) {
      reload();
      loadFamilles();
    }
  }, [db]);

  async function loadFamilles() {
    try {
      const rows = await db.select<Famille[]>(
        'SELECT id, nom FROM familles ORDER BY nom'
      );
      setFamilles(rows);
    } catch {
      setError('Lecture impossible');
    }
  }

  async function reload() {
    try {
      const rows = await db.select<SousFamille[]>(
        `SELECT s.id, s.nom, s.famille_id, f.nom AS famille
         FROM sous_familles s
         JOIN familles f ON f.id = s.famille_id
         ORDER BY f.nom, s.nom`
      );
      setItems(rows);
    } catch {
      setError('Lecture impossible');
    }
  }

  async function add() {
    if (!familleId || !nom) return;
    try {
      await db.execute('INSERT INTO sous_familles(famille_id, nom) VALUES (?, ?)', [
        Number(familleId),
        nom,
      ]);
      setNom('');
      setFamilleId('');
      reload();
    } catch (e: any) {
      if (String(e).includes('UNIQUE')) {
        alert('Cette sous-famille existe déjà');
      } else {
        alert('Erreur lors de l\'ajout');
      }
    }
  }

  async function remove(id: number) {
    try {
      await db.execute('DELETE FROM sous_familles WHERE id = ?', [id]);
      reload();
    } catch {
      alert('Suppression impossible');
    }
  }

  if (error) return <div>{error}</div>;
  if (!db) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Sous-familles</h1>
      <div>
        <select value={familleId} onChange={(e) => setFamilleId(e.target.value)}>
          <option value="">Choisir une famille</option>
          {familles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nom}
            </option>
          ))}
        </select>
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
            <th>Famille</th>
            <th>Nom</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.famille}</td>
              <td>{s.nom}</td>
              <td>
                <button onClick={() => remove(s.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
