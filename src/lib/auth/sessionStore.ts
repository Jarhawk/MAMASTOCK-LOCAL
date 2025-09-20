type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;

const memoryStore = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem(key: string): string | null {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  setItem(key: string, value: string) {
    memoryStore.set(key, value);
  },
  removeItem(key: string) {
    memoryStore.delete(key);
  },
  clear() {
    memoryStore.clear();
  }
};

function resolveNativeStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    const { sessionStorage } = window;
    if (!sessionStorage) return null;
    const testKey = "__mamastock_session_store_test__";
    sessionStorage.setItem(testKey, "1");
    sessionStorage.removeItem(testKey);
    return sessionStorage;
  } catch {
    return null;
  }
}

let activeStorage: StorageLike = resolveNativeStorage() ?? memoryStorage;

function runWithStorage<T>(fn: (storage: StorageLike) => T, fallbackValue: T): T {
  try {
    return fn(activeStorage);
  } catch {
    if (activeStorage !== memoryStorage) {
      activeStorage = memoryStorage;
      try {
        return fn(activeStorage);
      } catch {}
    }
    return fallbackValue;
  }
}

export const sessionStore = {
  get(key: string): string | null {
    return runWithStorage((storage) => storage.getItem(key), null);
  },
  set(key: string, value: string): void {
    runWithStorage((storage) => {
      storage.setItem(key, value);
    }, undefined);
  },
  remove(key: string): void {
    runWithStorage((storage) => {
      storage.removeItem(key);
    }, undefined);
  },
  clear(): void {
    runWithStorage((storage) => {
      storage.clear();
    }, undefined);
  }
};

export default sessionStore;
