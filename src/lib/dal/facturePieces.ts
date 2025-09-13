import { appDataDir, join } from "@tauri-apps/api/path";
import { open as dialogOpen } from "@tauri-apps/plugin-dialog";
import {
  exists, mkdir, copyFile, remove, readFile, writeFile, stat
} from "@tauri-apps/plugin-fs";
import { shell } from "@tauri-apps/plugin-shell";
import { getDb, isTauri } from "@/lib/db/sql";

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
  const base = await appDataDir();
  const dir = await join(base, "MamaStock", "pieces", "factures", factureId);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

async function safeCopy(src: string, dst: string) {
  try {
    await copyFile(src, dst); // rapide si autorisé
  } catch {
    // fallback lecture/écriture binaire
    const data = await readFile(src);
    await writeFile(dst, data);
  }
}

export async function listPieces(factureId: string): Promise<FacturePiece[]> {
  if (!isTauri) throw new Error("Tauri requis");
  const db = await getDb();
  const rows = await db.select<FacturePiece[]>(
    "SELECT * FROM facture_pieces WHERE facture_id = ? ORDER BY created_at DESC",
    [factureId]
  );
  return rows;
}

export async function attachFromPicker(factureId: string): Promise<FacturePiece[]> {
  if (!isTauri) throw new Error("Tauri requis");
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

export async function attachFiles(factureId: string, paths: string[]): Promise<FacturePiece[]> {
  if (!isTauri) throw new Error("Tauri requis");
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
  if (!isTauri) throw new Error("Tauri requis");
  const db = await getDb();

  const rows = await db.select<FacturePiece[]>(
    "SELECT stored_path FROM facture_pieces WHERE id = ?", [id]
  );
  const path = rows[0]?.stored_path;
  await db.execute("DELETE FROM facture_pieces WHERE id = ?", [id]);

  if (path) { try { await remove(path); } catch {} }
}

export async function openPiece(path: string) {
  if (!isTauri) throw new Error("Tauri requis");
  try {
    await shell.open(path);
  } catch (e) {
    console.error("Ouverture impossible:", e);
  }
}
