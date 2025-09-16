import React from "react";
import type { FacturePiece } from "@/lib/dal/facturePieces";
import { attachFromPicker, listPieces, openPiece, removePiece } from "@/lib/dal/facturePieces";
import { isTauri } from "@/lib/tauriEnv";

export default function PiecesManager({ factureId }: { factureId: string }) {
  const [items, setItems] = React.useState<FacturePiece[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!factureId || !isTauri()) return;
    try {
      setErr(null);
      const rows = await listPieces(factureId);
      setItems(rows);
    } catch (e:any) {
      setErr(e?.message || String(e));
    }
  }, [factureId]);

  React.useEffect(() => { refresh(); }, [refresh]);

  async function onAttach() {
    if (!isTauri()) return;
    try {
      setBusy(true);
      await attachFromPicker(factureId);
      await refresh();
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }
  async function onOpen(p: FacturePiece) {
    await openPiece(p.stored_path);
  }
  async function onDelete(p: FacturePiece) {
    if (!confirm(`Supprimer la pièce "${p.filename}" ?`)) return;
    await removePiece(p.id);
    await refresh();
  }

  if (!isTauri()) return <div className="text-sm opacity-70">Pièces: disponible en mode Tauri</div>;
  return (
    <div className="mt-4 border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Pièces jointes</h3>
        <button
          className="px-3 py-1 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          onClick={onAttach}
          disabled={busy}
        >
          Joindre…
        </button>
      </div>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      {items.length === 0 ? (
        <div className="text-sm opacity-70">Aucune pièce encore.</div>
      ) : (
        <ul className="space-y-2">
          {items.map(p => (
            <li key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{p.filename}</div>
                <div className="text-xs opacity-70">
                  {p.ext ?? "?"} · {(p.size ?? 0)} o · {new Date(p.created_at ?? "").toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-white border" onClick={() => onOpen(p)}>Ouvrir</button>
                <button className="px-2 py-1 rounded bg-white border text-red-600" onClick={() => onDelete(p)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
