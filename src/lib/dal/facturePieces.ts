import { join } from "@tauri-apps/api/path";

import { getDb } from "@/lib/db/database";
import { getDataDir } from "@/lib/paths";
import { isTauri } from "@/lib/tauriEnv";

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";

export type FacturePiece = {
  id: string;
  facture_id: string;
  filename: string;
  ext?: string | null;
  mime?: string | null;
  size?: number | null;
  stored_path: string;
  original_path?: string | null;
  created_at?: string;
};

function extOf(name: string) {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : null;
}
function guessMime(e?: string | null) {
  if (!e) return null;
  if (["png","jpg","jpeg","gif","webp"].includes(e)) return `image/${e==="jpg"?"jpeg":e}`;
  if (e === "pdf") return "application/pdf";
  if (["xls","xlsx"].includes(e)) return "application/vnd.ms-excel";
  if (["csv"].includes(e)) return "text/csv";
  if (["txt","md"].includes(e)) return "text/plain";
  return null;
}

async function piecesDirForFacture(factureId: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  // CODEREVIEW: store facture pieces under the shared AppData data directory
  const dataDir = await getDataDir();
  const dir = await join(dataDir, "pieces", "factures", factureId);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

async function safeCopy(src: string, dst: string) {
  const { copyFile, readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  try {
    await copyFile(src, dst); // rapide si autorisé
  } catch {
    // fallback lecture/écriture binaire
    const data = await readFile(src);
    await writeFile(dst, data);
  }
}

export async function listPieces(factureId: string): Promise<FacturePiece[]> {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return [];
  }
  const db = await getDb();
  const rows = await db.select<FacturePiece[]>(
    "SELECT * FROM facture_pieces WHERE facture_id = ? ORDER BY created_at DESC",
    [factureId]
  );
  return rows;
}

export async function attachFromPicker(factureId: string): Promise<FacturePiece[]> {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return [];
  }
  const { open: dialogOpen } = await import("@tauri-apps/plugin-dialog");
  const sel = await dialogOpen({
    multiple: true,
    filters: [
      { name: "Docs", extensions: ["pdf","png","jpg","jpeg","webp","gif","xls","xlsx","csv","txt"] },
      { name: "Tous", extensions: ["*"] }
    ]
  });
  const paths = (Array.isArray(sel) ? sel : (sel ? [sel] : [])) as string[];
  if (!paths.length) return [];

  return await attachFiles(factureId, paths);
}

export async function attachFiles(
  factureId: string,
  paths: string[]
): Promise<FacturePiece[]> {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return [];
  }
  const dir = await piecesDirForFacture(factureId);
  const db = await getDb();

  const out: FacturePiece[] = [];
  for (const src of paths) {
    const base = src.split(/[\\/]/).pop() || "fichier";
    const ex = extOf(base);
    const mime = guessMime(ex);
    const id = crypto.randomUUID();
    const targetName = `${id}-${base}`;
    const dst = await join(dir, targetName);

    // copie physique dans AppData
    await safeCopy(src, dst);

    // taille
    let size: number | null = null;
    const { stat } = await import("@tauri-apps/plugin-fs");
    try { size = (await stat(dst))?.size ?? null; } catch {}

    // enregistrement SQL
    await db.execute(
      `INSERT INTO facture_pieces (id, facture_id, filename, ext, mime, size, stored_path, original_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, factureId, base, ex, mime, size, dst, src]
    );

    out.push({
      id, facture_id: factureId, filename: base, ext: ex ?? undefined, mime: mime ?? undefined,
      size: size ?? undefined, stored_path: dst, original_path: src
    });
  }
  return out;
}

export async function removePiece(id: string): Promise<void> {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  const db = await getDb();

  const rows = await db.select<FacturePiece[]>(
    "SELECT stored_path FROM facture_pieces WHERE id = ?", [id]
  );
  const path = rows[0]?.stored_path;
  await db.execute("DELETE FROM facture_pieces WHERE id = ?", [id]);

  if (path) {
    try {
      const { remove } = await import("@tauri-apps/plugin-fs");
      await remove(path);
    } catch {}
  }
}

export async function openPiece(path: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  try {
    const { shell } = await import("@tauri-apps/plugin-shell");
    await shell.open(path);
  } catch (e) {
    console.error("Ouverture impossible:", e);
  }
}
