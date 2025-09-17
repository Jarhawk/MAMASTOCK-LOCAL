import { toast } from "sonner";

import { isTauri } from "@/lib/tauriEnv";

export default function SystemTools() {
  const backup = () => {
    toast.error("Sauvegarde indisponible avec PostgreSQL");
  };

  const restore = () => {
    toast.error("Restauration indisponible avec PostgreSQL");
  };

  const maintain = () => {
    toast.error("Maintenance indisponible avec PostgreSQL");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Outils système</h1>
      <div className="flex gap-2">
        <button onClick={backup} className="border px-2 py-1" disabled={!isTauri()}>Sauvegarder</button>
        <button onClick={restore} className="border px-2 py-1" disabled={!isTauri()}>Restaurer</button>
        <button onClick={maintain} className="border px-2 py-1" disabled={!isTauri()}>Maintenance</button>
      </div>
    </div>
  );
}
