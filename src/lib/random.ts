export function randomBytes(len: number): Uint8Array {
  const u8 = new Uint8Array(len);
  crypto.getRandomValues(u8);
  return u8;
}
