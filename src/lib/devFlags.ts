export type DevFlags = {
  isDev: boolean;
  isTauri: boolean;
  forceSidebar: boolean;
  allowAllRoutes: boolean;
  reason: {
    sidebar: string | false;
    routes: string | false;
  };
};

const globalWindow = typeof window !== "undefined" ? window : undefined;

const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV === true;
const isTauri = !!(globalWindow && (globalWindow as any).__TAURI__);

let searchParams: URLSearchParams | undefined;
if (typeof window !== "undefined" && typeof window.location !== "undefined") {
  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch {}
}

function readQueryFlag(key: string): boolean {
  if (!searchParams) return false;
  try {
    return searchParams.get(key) === "1";
  } catch {
    return false;
  }
}

function readStorageFlag(key: string): boolean {
  if (!globalWindow || !globalWindow.localStorage) return false;
  try {
    return globalWindow.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

const forceSidebar = readQueryFlag("sidebar") || readStorageFlag("DEV_FORCE_SIDEBAR");
const allowAllRoutes = readQueryFlag("allowRoutes") || readStorageFlag("DEV_ALLOW_ALL_ROUTES");

export const devFlags: DevFlags = {
  isDev,
  isTauri,
  forceSidebar,
  allowAllRoutes,
  reason: {
    sidebar: isDev && (forceSidebar ? "forceSidebar" : "devDefault"),
    routes: isDev && (allowAllRoutes ? "allowAllRoutes" : "devDefault")
  }
};

if (globalWindow) {
  (globalWindow as any).__DEV_FLAGS__ = devFlags;
}

export { isDev, isTauri, forceSidebar, allowAllRoutes };
