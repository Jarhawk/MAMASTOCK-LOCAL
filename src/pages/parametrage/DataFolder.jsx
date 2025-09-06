import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { setDataDir, getDataDir } from "@/lib/db";

export default function DataFolder() {
  const [dir, setDir] = useState("");

  useEffect(() => {
    getDataDir().then(setDir);
  }, []);

  const choose = async () => {
    const selected = await open({ directory: true });
    if (selected) setDir(selected as string);
  };

  const save = async () => {
    if (dir) await setDataDir(dir);
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
      </div>
    </div>
  );
}
