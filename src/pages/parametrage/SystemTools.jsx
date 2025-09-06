import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { backupDb, restoreDb, maintenanceDb } from "@/lib/db";

export default function SystemTools() {
  const [message, setMessage] = useState("");

  const doBackup = async () => {
    try {
      await backupDb();
      setMessage("Sauvegarde effectuée.");
    } catch (e) {
      setMessage(`Erreur sauvegarde: ${e}`);
    }
  };

  const doRestore = async () => {
    try {
      const file = await open({ filters: [{ name: "Database", extensions: ["db"] }] });
      if (file) {
        await restoreDb(file as string);
        setMessage("Base restaurée. Veuillez redémarrer l'application.");
      }
    } catch (e) {
      setMessage(`Erreur restauration: ${e}`);
    }
  };

  const doMaintenance = async () => {
    try {
      await maintenanceDb();
      setMessage("Maintenance terminée.");
    } catch (e) {
      setMessage(`Erreur maintenance: ${e}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Outils système</h1>
      <div className="flex flex-col gap-2">
        <button onClick={doBackup} className="border px-2 py-1">
          Sauvegarder
        </button>
        <button onClick={doRestore} className="border px-2 py-1">
          Restaurer
        </button>
        <button onClick={doMaintenance} className="border px-2 py-1">
          Maintenance
        </button>
      </div>
      {message && <div>{message}</div>}
    </div>
  );
}
