type SessionStore = {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const memoryStore = new Map<string, string>();

let cachedSessionStorage: Storage | null | undefined;
let forceMemory = false;

function readFromMemory(key: string): string | null {
  return memoryStore.has(key) ? memoryStore.get(key)! : null;
}

function writeToMemory(key: string, value: string): void {
  memoryStore.set(key, value);
}

function removeFromMemory(key: string): void {
  memoryStore.delete(key);
}

function clearMemory(): void {
  memoryStore.clear();
}

function resolveNativeSessionStorage(): Storage | null {
  if (forceMemory) return null;
  if (cachedSessionStorage !== undefined) return cachedSessionStorage;

  if (typeof window === "undefined") {
    cachedSessionStorage = null;
    return null;
  }

  try {
    const storage = window.sessionStorage;
    if (!storage) {
      cachedSessionStorage = null;
      return null;
    }

    const probeKey = "__mama_session_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);

    cachedSessionStorage = storage;
    return storage;
  } catch {
    cachedSessionStorage = null;
    forceMemory = true;
    return null;
  }
}

function withNativeStorage<T>(fn: (storage: Storage) => T): T | null {
  const storage = resolveNativeSessionStorage();
  if (!storage) return null;

  try {
    return fn(storage);
  } catch {
    forceMemory = true;
    cachedSessionStorage = null;
    return null;
  }
}

export const sessionStore: SessionStore = {
  get(key) {
    if (!forceMemory) {
      const value = withNativeStorage((storage) => storage.getItem(key));
      if (typeof value === "string" || value === null) {
        if (typeof value === "string") {
          writeToMemory(key, value);
        } else {
          removeFromMemory(key);
        }
        return value;
      }
    }

    return readFromMemory(key);
  },

  set(key, value) {
    writeToMemory(key, value);
    if (forceMemory) return;
    withNativeStorage((storage) => {
      storage.setItem(key, value);
      return null;
    });
  },

  remove(key) {
    removeFromMemory(key);
    if (forceMemory) return;
    withNativeStorage((storage) => {
      storage.removeItem(key);
      return null;
    });
  },

  clear() {
    clearMemory();
    if (forceMemory) return;
    withNativeStorage((storage) => {
      storage.clear();
      return null;
    });
  }
};

export type { SessionStore };
