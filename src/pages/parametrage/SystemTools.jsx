import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { backupDb, restoreDb, maintenanceDb } from "@/lib/db";

export default function SystemTools() {
  const [message, setMessage] = useState("");

  const backup = async () => {
    await backupDb();
    setMessage("Sauvegarde effectuée.");
  };

  const restore = async () => {
    const file = await open({ filters: [{ name: "Base", extensions: ["db"] }] });
    if (file) {
      await restoreDb(String(file));
      setMessage("Base restaurée. Veuillez redémarrer l'application.");
    }
  };

  const maintain = async () => {
    await maintenanceDb();
    setMessage("Maintenance effectuée.");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Outils système</h1>
      <div className="flex gap-2">
        <button onClick={backup} className="border px-2 py-1">Sauvegarder</button>
        <button onClick={restore} className="border px-2 py-1">Restaurer</button>
        <button onClick={maintain} className="border px-2 py-1">Maintenance</button>
      </div>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
