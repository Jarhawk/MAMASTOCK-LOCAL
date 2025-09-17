import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadConfig } from '@/local/config';
import { getDataDir } from '@/lib/paths';
import { isTauri } from '@/lib/tauriEnv';

export default function DossierDonnees() {
  const [baseDir, setBaseDir] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configExists, setConfigExists] = useState(false);
  const [dbUrl, setDbUrl] = useState('');

  const refresh = async () => {
    if (isTauri()) {
      const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
      // CODEREVIEW: rely on AppData helpers to avoid writing under Program Files
      const dataDir = await getDataDir();
      setBaseDir(dataDir);
      await mkdir(dataDir, { recursive: true }).catch(() => {});
      const { configDir } = await import('@tauri-apps/api/path');
      const dir = await configDir();
      const file = dir + 'MamaStock/config.json';
      setConfigPath(file);
      const existsConfig = await exists(file);
      setConfigExists(existsConfig);
      try {
        const { dbUrl } = await loadConfig();
        setDbUrl(dbUrl);
      } catch (err) {
        console.warn('[dossier] Impossible de charger la configuration DB', err);
        setDbUrl('');
      }
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openDir = async () => {
    if (isTauri()) {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(baseDir);
    }
  };

  const ensureDir = async () => {
    if (isTauri()) {
      const { mkdir, exists } = await import('@tauri-apps/plugin-fs');
      await mkdir(baseDir, { recursive: true });
      if (configPath) {
        setConfigExists(await exists(configPath));
      }
    }
  };
  if (!isTauri()) return <p>Cette fonction nécessite Tauri (application desktop).</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dossier données</h1>
      <div>
        <p className="text-sm break-all">{baseDir || 'Tauri indisponible'}</p>
        {configPath && (
          <p className="text-sm break-all">
            Configuration : {configExists ? configPath : `${configPath} (absente)`}
          </p>
        )}
        {dbUrl ? (
          <p className="text-sm break-all">URL PostgreSQL : {dbUrl}</p>
        ) : (
          <p className="text-sm">URL PostgreSQL non configurée.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={openDir}>Ouvrir le dossier</Button>
        <Button onClick={ensureDir}>Créer si manquant</Button>
      </div>
    </div>
  );
}
