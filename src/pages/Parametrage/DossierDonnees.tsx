import { useEffect, useState } from 'react';
import { appDataDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';

export default function DossierDonnees() {
  const [path, setPath] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const base = await appDataDir();
        const p = await join(base, 'MamaStock', 'data');
        setPath(p);
      } catch {
        setError('Chemin introuvable');
      }
    })();
  }, []);

  async function handleOpen() {
    try {
      await open(path);
    } catch {
      alert('Ouverture impossible');
    }
  }

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Dossier données</h1>
      <p>{path || '...'}</p>
      <button onClick={handleOpen}>Ouvrir</button>
    </div>
  );
}
