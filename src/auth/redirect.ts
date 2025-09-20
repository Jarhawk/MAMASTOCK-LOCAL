import type { Location } from "react-router-dom";

import {
  clearStoredRedirect,
  readStoredRedirect,
  writeStoredRedirect
} from "@/lib/auth/sessionState";
const DEFAULT_REDIRECT_HASH = "#/dashboard";
const DEFAULT_REDIRECT_PATH = "/dashboard";

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
  try {
    const raw = readStoredRedirect();
    if (!raw) return null;
    return normalizeRedirectHash(raw);
  } catch {
    return null;
  }
}

export function setRedirectTo(target: string | null | undefined): void {
  try {
    if (!target) {
      clearStoredRedirect();
      return;
    }
    const normalized = normalizeRedirectHash(target);
    writeStoredRedirect(normalized);
  } catch {
    // ignore storage errors
  }
}

export function clearRedirectTo(): void {
  clearStoredRedirect();
}

export function redirectHashToPath(hash: string | null | undefined): string {
  if (!hash) return DEFAULT_REDIRECT_PATH;
  const normalized = normalizeRedirectHash(hash);
  const path = normalized.slice(1);
  return path ? path : DEFAULT_REDIRECT_PATH;
}

export { DEFAULT_REDIRECT_HASH, DEFAULT_REDIRECT_PATH };
