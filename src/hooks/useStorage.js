// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { saveBinary, deleteFile as removeFile, readBinary } from "@/local/files";

export function pathFromUrl(url) {
  return url || "";
}

export async function uploadFile(bucket, file, folder = "") {
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const relPath = [bucket, folder, fileName].filter(Boolean).join("/");
  const data = new Uint8Array(await file.arrayBuffer());
  await saveBinary(relPath, data);
  return relPath;
}

export async function deleteFile(bucket, path) {
  if (!path) return;
  const relPath = path.startsWith(`${bucket}/`) ? path : `${bucket}/${path}`;
  await removeFile(relPath);
}

export async function replaceFile(bucket, file, previous = "", folder = "") {
  const path = previous ? pathFromUrl(previous) : "";
  if (path) {
    try {
      await deleteFile(bucket, path);
    } catch {}
  }
  return uploadFile(bucket, file, folder);
}

export async function downloadFile(bucket, path) {
  if (!path) throw new Error("No path provided");
  const relPath = path.startsWith(`${bucket}/`) ? path : `${bucket}/${path}`;
  return await readBinary(relPath);
}