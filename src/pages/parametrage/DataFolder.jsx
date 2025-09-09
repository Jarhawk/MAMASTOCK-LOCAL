import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { setDataDir, getDataDir, getExportDir, setExportDir } from "@/lib/db";
import { isTauri } from "@/lib/isTauri";

export default function DataFolder() {
  const [dir, setDir] = useState("");
  const [saved, setSaved] = useState(false);
  const [exportDir, setExportDirState] = useState("");
  const [exportSaved, setExportSaved] = useState(false);

  useEffect(() => {
    if (isTauri) {
      getDataDir().then(setDir);
      getExportDir().then(setExportDirState);
    } else {
      console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
  }, []);

  const choose = async () => {
    if (!isTauri) {
      return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
    const selected = await open({ directory: true });
    if (selected) setDir(String(selected));
  };

  const chooseExport = async () => {
    if (!isTauri) {
      return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
    const selected = await open({ directory: true });
    if (selected) setExportDirState(String(selected));
  };

  const save = async () => {
    if (!isTauri) {
      return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
    if (dir) {
      await setDataDir(dir);
      setSaved(true);
    }
  };

  const saveExport = async () => {
    if (!isTauri) {
      return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
    if (exportDir) {
      await setExportDir(exportDir);
      setExportSaved(true);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Paramètres</h1>
      <div className="space-y-2">
        <label>Dossier des données</label>
        <input
          value={dir}
          onChange={(e) => setDir(e.target.value)}
          className="border p-1 w-full"
        />
        <div className="flex gap-2">
          <button onClick={choose} className="border px-2 py-1">
            Choisir...
          </button>
          <button onClick={save} className="border px-2 py-1">
            Enregistrer
          </button>
        </div>
        {saved && (
          <p className="text-sm text-gray-500">
            Redémarrez l'application pour appliquer les modifications.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label>Dossier des exports</label>
        <input
          value={exportDir}
          onChange={(e) => setExportDirState(e.target.value)}
          className="border p-1 w-full"
        />
        <div className="flex gap-2">
          <button onClick={chooseExport} className="border px-2 py-1">
            Choisir...
          </button>
          <button onClick={saveExport} className="border px-2 py-1">
            Enregistrer
          </button>
        </div>
        {exportSaved && (
          <p className="text-sm text-gray-500">
            Le dossier d'export a été enregistré.
          </p>
        )}
      </div>
    </div>
  );
}
