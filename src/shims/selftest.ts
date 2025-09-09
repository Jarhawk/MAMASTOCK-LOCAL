export async function testRandom() {
  const { randomBytes } = (window as any).cryptoShim ?? await import("/src/shims/crypto");
  const b = randomBytes(16) as Uint8Array;
  if (!(b && b.length === 16)) throw new Error("randomBytes failed");
}
