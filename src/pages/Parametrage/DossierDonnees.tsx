import { useEffect, useState } from 'react';
import { isTauri } from "@/lib/tauriEnv";

export default function DossierDonnees() {
  const [path, setPath] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTauri()) return;
    (async () => {
      try {
        const { appDataDir, join } = await import('@tauri-apps/api/path');
        const base = await appDataDir();
        const p = await join(base, 'MamaStock', 'data');
        setPath(p);
      } catch {
        setError('Chemin introuvable');
      }
    })();
  }, []);

  async function handleOpen() {
    if (!isTauri()) {
      alert('Cette action nécessite Tauri');
      return;
    }
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(path);
    } catch {
      alert('Ouverture impossible');
    }
  }

  if (!isTauri()) return <p>Cette fonction nécessite Tauri (application desktop).</p>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Dossier données</h1>
      <p>{path || '...'}</p>
      <button onClick={handleOpen}>Ouvrir</button>
    </div>
  );
}
