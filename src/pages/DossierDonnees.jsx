import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { isTauri, getDb } from '@/lib/db/sql';

export default function DossierDonnees() {
  const [baseDir, setBaseDir] = useState('');
  const [dbPath, setDbPath] = useState('');
  const [dbExists, setDbExists] = useState(false);

  const refresh = async () => {
    if (isTauri) {
      const { appDataDir, join } = await import('@tauri-apps/api/path');
      const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
      const root = await appDataDir();
      const appDir = await join(root, 'MamaStock');
      setBaseDir(appDir);
      const dbDir = await join(appDir, 'databases');
      const file = await join(dbDir, 'mamastock.db');
      setDbPath(file);
      setDbExists(await exists(file));
      // ensure directories exist when checking
      await mkdir(appDir, { recursive: true }).catch(() => {});
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openDir = async () => {
    if (isTauri) {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(baseDir);
    }
  };

  const ensureDir = async () => {
    if (isTauri) {
      const { mkdir, exists } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      await mkdir(baseDir, { recursive: true });
      const dbDir = await join(baseDir, 'databases');
      await mkdir(dbDir, { recursive: true });
      setDbExists(await exists(dbPath));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dossier données</h1>
      <div>
        <p className="text-sm break-all">{baseDir || 'Tauri indisponible'}</p>
        {dbPath && (
          <p className="text-sm break-all">
            Base de données : {dbExists ? dbPath : `${dbPath} (absente)`}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={openDir}>Ouvrir le dossier</Button>
        <Button onClick={ensureDir}>Créer si manquant</Button>
      </div>
    </div>
  );
}
