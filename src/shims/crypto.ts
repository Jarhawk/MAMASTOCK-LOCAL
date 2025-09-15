import { isTauri } from "@/lib/db/sql";const cryptoObj = globalThis.crypto;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).
  map((b) => b.toString(16).padStart(2, "0")).
  join("");
}

export function randomBytes(len: number): Uint8Array {
  const out = new Uint8Array(len);
  cryptoObj.getRandomValues(out);
  return out;
}

export function randomUUID(): string {
  return cryptoObj.randomUUID();
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await cryptoObj.subtle.digest("SHA-256", enc.encode(input));
  return toHex(new Uint8Array(digest));
}

export default { randomBytes, randomUUID, sha256Hex };