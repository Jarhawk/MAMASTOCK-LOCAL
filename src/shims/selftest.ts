import { isTauri } from "@/lib/runtime/isTauri";export async function testRandom() {
  const shim = (window as any).cryptoShim ?? (await import("/src/shims/crypto"));
  const uuid = shim.randomUUID();
  if (!(uuid && typeof uuid === "string")) throw new Error("randomUUID failed");
  const hash = await shim.sha256Hex("test");
  if (!(hash && hash.length === 64)) throw new Error("sha256Hex failed");
}