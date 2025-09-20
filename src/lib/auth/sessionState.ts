import { sessionStore } from "./sessionStore";

const AUTH_USER_KEY = "auth.user";
const AUTH_TOKEN_KEY = "auth.token";
const AUTH_FLAGS_KEY = "auth.flags";
const AUTH_REDIRECT_KEY = "redirectTo";
const FIRST_RUN_FLAG = "firstRun";

type SessionFlags = Record<string, boolean>;

function readJSON<T>(key: string): T | null {
  const raw = sessionStore.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    const serialized = JSON.stringify(value);
    sessionStore.set(key, serialized);
  } catch {
    sessionStore.remove(key);
  }
}

export function readStoredUser<T = unknown>(): T | null {
  return readJSON<T>(AUTH_USER_KEY);
}

export function writeStoredUser(value: unknown | null): void {
  if (value == null) {
    sessionStore.remove(AUTH_USER_KEY);
    return;
  }
  writeJSON(AUTH_USER_KEY, value);
}

export function clearStoredUser(): void {
  sessionStore.remove(AUTH_USER_KEY);
}

export function readStoredToken(): string | null {
  return sessionStore.get(AUTH_TOKEN_KEY);
}

export function writeStoredToken(token: string | null): void {
  if (!token) {
    sessionStore.remove(AUTH_TOKEN_KEY);
    return;
  }
  sessionStore.set(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  sessionStore.remove(AUTH_TOKEN_KEY);
}

function readFlags(): SessionFlags {
  return readJSON<SessionFlags>(AUTH_FLAGS_KEY) ?? {};
}

function writeFlags(flags: SessionFlags): void {
  if (!flags || Object.keys(flags).length === 0) {
    sessionStore.remove(AUTH_FLAGS_KEY);
    return;
  }
  writeJSON(AUTH_FLAGS_KEY, flags);
}

export function getSessionFlag(name: string): boolean {
  const flags = readFlags();
  return Boolean(flags[name]);
}

export function setSessionFlag(name: string, value: boolean): void {
  const flags = readFlags();
  if (value) {
    flags[name] = true;
  } else {
    delete flags[name];
  }
  writeFlags(flags);
}

export function clearSessionFlags(): void {
  sessionStore.remove(AUTH_FLAGS_KEY);
}

export function isFirstRunComplete(): boolean {
  return getSessionFlag(FIRST_RUN_FLAG);
}

export function setFirstRunComplete(value: boolean): void {
  setSessionFlag(FIRST_RUN_FLAG, value);
}

export function readStoredRedirect(): string | null {
  return sessionStore.get(AUTH_REDIRECT_KEY);
}

export function writeStoredRedirect(value: string | null): void {
  if (!value) {
    sessionStore.remove(AUTH_REDIRECT_KEY);
    return;
  }
  sessionStore.set(AUTH_REDIRECT_KEY, value);
}

export function clearStoredRedirect(): void {
  sessionStore.remove(AUTH_REDIRECT_KEY);
}

export {
  AUTH_USER_KEY,
  AUTH_TOKEN_KEY,
  AUTH_FLAGS_KEY,
  AUTH_REDIRECT_KEY,
  FIRST_RUN_FLAG
};
