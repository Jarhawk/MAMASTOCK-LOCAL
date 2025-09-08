import { getCurrent } from "@tauri-apps/api/window";
import { appDataDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-shell";

export default function DebugRibbon() {
  const show = import.meta.env.DEV || window.DEBUG;
  if (!show) return null;

  const openDev = () => {
    try {
      getCurrent().openDevtools();
    } catch {}
  };

  const openLogs = async () => {
    try {
      const dir = await appDataDir();
      const logDir = await join(dir, "logs");
      await open(logDir);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed top-0 right-0 m-2 flex gap-2 z-50 text-xs bg-black/50 text-white rounded p-1">
      <button className="px-2 py-1 hover:bg-black/30 rounded" onClick={openDev}>
        Ouvrir DevTools
      </button>
      <button className="px-2 py-1 hover:bg-black/30 rounded" onClick={openLogs}>
        Voir le fichier de logs
      </button>
    </div>
  );
}

