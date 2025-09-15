import { isTauri } from "@/lib/db/sql";export function randomBytes(len: number): Uint8Array {
  const out = new Uint8Array(len);
  // Web Crypto in the browser & Tauri webview
  crypto.getRandomValues(out);
  return out;
}

export async function sha256(data: Uint8Array | string): Promise<Uint8Array> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(hash);
}