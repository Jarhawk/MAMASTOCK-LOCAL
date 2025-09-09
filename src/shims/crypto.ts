function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("");
}
export function randomBytes(len: number) {
  const out = new Uint8Array(len);
  (globalThis.crypto || window.crypto).getRandomValues(out);
  (out as any).toString = (enc?: string) => enc === "hex" ? toHex(out) : Object.prototype.toString.call(out);
  return out;
}
export default { randomBytes };
