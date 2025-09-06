import { open } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { backupDb, restoreDb, maintenanceDb } from "@/lib/db";
import { toast } from "sonner";

export default function SystemTools() {
  const backup = async () => {
    try {
      const dest = await backupDb();
      toast.success(`Sauvegarde effectuée : ${dest}`);
    } catch (_) {
      toast.error("Échec de la sauvegarde");
    }
  };

  const restore = async () => {
    try {
      const file = await open({ filters: [{ name: "Base", extensions: ["db"] }] });
      if (file && window.confirm("Restaurer cette sauvegarde ? L'application redémarrera.")) {
        await restoreDb(String(file));
        toast.success("Base restaurée. Redémarrage…");
        await relaunch();
      }
    } catch (_) {
      toast.error("Échec de la restauration");
    }
  };

  const maintain = async () => {
    try {
      await maintenanceDb();
      toast.success("Maintenance effectuée");
    } catch (_) {
      toast.error("Échec de la maintenance");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Outils système</h1>
      <div className="flex gap-2">
        <button onClick={backup} className="border px-2 py-1">Sauvegarder</button>
        <button onClick={restore} className="border px-2 py-1">Restaurer</button>
        <button onClick={maintain} className="border px-2 py-1">Maintenance</button>
      </div>
    </div>
  );
}
