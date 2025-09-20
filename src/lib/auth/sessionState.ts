import { sessionStore } from "@/lib/auth/sessionStore";

export const SESSION_KEYS = {
  user: "auth.user",
  token: "auth.token",
  flags: "auth.session.flags",
  redirectTo: "redirectTo",
  firstRun: "firstRun"
} as const;

export type PersistedUser = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  role?: string | null;
};

export type SessionFlags = Record<string, boolean>;

function normalizeUser(input: unknown): PersistedUser | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Partial<PersistedUser>;
  return {
    id: value?.id ?? null,
    email: value?.email ?? null,
    mama_id: value?.mama_id ?? null,
    role: value?.role ?? null
  };
}

export function readStoredUser(): PersistedUser | null {
  const raw = sessionStore.get(SESSION_KEYS.user);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return normalizeUser(parsed);
  } catch {
    return null;
  }
}

export function writeStoredUser(user: PersistedUser | null | undefined): void {
  if (!user) {
    sessionStore.remove(SESSION_KEYS.user);
    return;
  }
  const normalized = normalizeUser(user);
  if (!normalized) {
    sessionStore.remove(SESSION_KEYS.user);
    return;
  }
  try {
    sessionStore.set(SESSION_KEYS.user, JSON.stringify(normalized));
  } catch {
    sessionStore.remove(SESSION_KEYS.user);
  }
}

export function clearStoredUser(): void {
  sessionStore.remove(SESSION_KEYS.user);
}

export function readStoredToken(): string | null {
  const raw = sessionStore.get(SESSION_KEYS.token);
  if (typeof raw === "string" && raw.trim()) {
    return raw;
  }
  return null;
}

export function writeStoredToken(token: string | null | undefined): void {
  if (typeof token === "string" && token.trim()) {
    sessionStore.set(SESSION_KEYS.token, token);
    return;
  }
  sessionStore.remove(SESSION_KEYS.token);
}

function normalizeFlags(flags: SessionFlags | null | undefined): SessionFlags {
  if (!flags || typeof flags !== "object") return {};
  const result: SessionFlags = {};
  for (const [key, value] of Object.entries(flags)) {
    if (!key) continue;
    result[key] = !!value;
  }
  return result;
}

export function readStoredSessionFlags(): SessionFlags {
  const raw = sessionStore.get(SESSION_KEYS.flags);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return normalizeFlags(parsed as SessionFlags);
  } catch {
    return {};
  }
}

export function writeStoredSessionFlags(flags: SessionFlags | null | undefined): void {
  const normalized = normalizeFlags(flags);
  if (Object.keys(normalized).length === 0) {
    sessionStore.remove(SESSION_KEYS.flags);
    return;
  }
  try {
    sessionStore.set(SESSION_KEYS.flags, JSON.stringify(normalized));
  } catch {
    sessionStore.remove(SESSION_KEYS.flags);
  }
}

export function normalizeRedirectTarget(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  let trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[a-z]+:/i.test(trimmed) || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/#/")) {
    trimmed = trimmed.slice(2);
  }
  if (trimmed.startsWith("#/")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.startsWith("#")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.startsWith("?")) {
    trimmed = `/${trimmed}`;
  }
  if (!trimmed.startsWith("/")) {
    trimmed = `/${trimmed}`;
  }
  if (trimmed.length === 0) return null;
  return trimmed;
}

export function readStoredRedirectTo(): string | null {
  const raw = sessionStore.get(SESSION_KEYS.redirectTo);
  return normalizeRedirectTarget(raw);
}

export function writeStoredRedirectTo(value: string | null | undefined): void {
  const normalized = normalizeRedirectTarget(value);
  if (!normalized) {
    sessionStore.remove(SESSION_KEYS.redirectTo);
    return;
  }
  sessionStore.set(SESSION_KEYS.redirectTo, normalized);
}

export function readStoredFirstRun(): boolean | null {
  const raw = sessionStore.get(SESSION_KEYS.firstRun);
  if (raw === null) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return null;
}

export function writeStoredFirstRun(value: boolean | null | undefined): void {
  if (value === undefined || value === null) {
    sessionStore.remove(SESSION_KEYS.firstRun);
    return;
  }
  sessionStore.set(SESSION_KEYS.firstRun, value ? "1" : "0");
}

export function clearAuthSessionStorage(): void {
  sessionStore.remove(SESSION_KEYS.user);
  sessionStore.remove(SESSION_KEYS.token);
  sessionStore.remove(SESSION_KEYS.flags);
  sessionStore.remove(SESSION_KEYS.redirectTo);
  sessionStore.remove(SESSION_KEYS.firstRun);
}
