function hexOf(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function randomBytes(len: number, cb?: (err: Error|null, buf: Uint8Array) => void): Uint8Array | void {
  const out = new Uint8Array(len);
  (globalThis.crypto || window.crypto).getRandomValues(out);
  // decorate with toString('hex') because some libs expect Buffer-like
  (out as any).toString = (enc?: string) => enc === "hex" ? hexOf(out) : Object.prototype.toString.call(out);
  if (cb) { cb(null, out); return; }
  return out;
}

export default { randomBytes };
