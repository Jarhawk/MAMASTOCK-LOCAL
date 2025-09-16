const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function readOptionalBoolean(name: keyof ImportMetaEnv): boolean | null {
  const value = import.meta.env[name];
  if (typeof value === "undefined") return null;
  const normalized = String(value).toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return null;
}

export function isDevMode(): boolean {
  return Boolean(import.meta.env?.DEV);
}

export function shouldBypassAccessGuards(): boolean {
  if (!isDevMode()) return false;
  const allowAll = readOptionalBoolean("VITE_ALLOW_ALL_ROUTES");
  if (allowAll !== null) return allowAll;
  const legacyFakeAuth = readOptionalBoolean("VITE_DEV_FAKE_AUTH");
  if (legacyFakeAuth !== null) return legacyFakeAuth;
  const legacyForceSidebar = readOptionalBoolean("VITE_DEV_FORCE_SIDEBAR");
  if (legacyForceSidebar !== null) return legacyForceSidebar;
  return true;
}

export function shouldForceSidebar(): boolean {
  return shouldBypassAccessGuards();
}

export function getPreferredDataSource(): string {
  const source = import.meta.env?.VITE_DATA_SOURCE;
  return typeof source === "string" && source.trim() !== ""
    ? source
    : "sqlite";
}

export function isSqlitePreferred(): boolean {
  return getPreferredDataSource().toLowerCase() === "sqlite";
}
