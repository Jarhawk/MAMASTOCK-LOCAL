import type { Location } from "react-router-dom";

const REDIRECT_KEY = "redirectTo";
const DEFAULT_REDIRECT_HASH = "#/dashboard";
const DEFAULT_REDIRECT_PATH = "/dashboard";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function normalizeRedirectHash(input?: string | null): string {
  if (!input) return DEFAULT_REDIRECT_HASH;
  let value = String(input).trim();
  if (!value) return DEFAULT_REDIRECT_HASH;

  if (!value.startsWith("#")) {
    if (!value.startsWith("/")) {
      value = `/${value}`;
    }
    value = `#${value}`;
  }

  if (value === "#" || value === "#/") {
    return DEFAULT_REDIRECT_HASH;
  }

  if (!value.startsWith("#/")) {
    const tail = value.slice(1);
    const normalizedTail = tail.startsWith("/") ? tail : `/${tail}`;
    value = `#${normalizedTail}`;
  }

  return value;
}

export function buildRedirectHash(location?: Location | null): string {
  if (typeof window !== "undefined") {
    const currentHash = window.location?.hash;
    if (typeof currentHash === "string" && currentHash) {
      return normalizeRedirectHash(currentHash);
    }
  }

  if (location) {
    const path = `${location.pathname ?? ""}${location.search ?? ""}${location.hash ?? ""}`;
    if (path) {
      return normalizeRedirectHash(path);
    }
  }

  return DEFAULT_REDIRECT_HASH;
}

export function getRedirectTo(): string | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(REDIRECT_KEY);
    if (!raw) return null;
    return normalizeRedirectHash(raw);
  } catch {
    return null;
  }
}

export function setRedirectTo(target: string | null | undefined): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    if (!target) {
      storage.removeItem(REDIRECT_KEY);
      return;
    }
    const normalized = normalizeRedirectHash(target);
    storage.setItem(REDIRECT_KEY, normalized);
  } catch {
    // ignore storage errors
  }
}

export function clearRedirectTo(): void {
  setRedirectTo(null);
}

export function redirectHashToPath(hash: string | null | undefined): string {
  if (!hash) return DEFAULT_REDIRECT_PATH;
  const normalized = normalizeRedirectHash(hash);
  const path = normalized.slice(1);
  return path ? path : DEFAULT_REDIRECT_PATH;
}

export { DEFAULT_REDIRECT_HASH, DEFAULT_REDIRECT_PATH };
