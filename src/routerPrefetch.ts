export type RoutePrefetcher = () => Promise<unknown>;

const registry = new Map<string, RoutePrefetcher>();
const pendingLoads = new Map<string, Promise<unknown>>();

function normalizePath(input: string): string {
  if (!input) return "/";
  const url = input.split("?")[0].split("#")[0] || "/";
  const withLeading = url.startsWith("/") ? url : `/${url}`;
  const trimmed = withLeading.replace(/\/+$/g, "");
  return trimmed || "/";
}

export function registerRoutePrefetch(path: string, loader: RoutePrefetcher) {
  const normalized = normalizePath(path);
  if (!registry.has(normalized)) {
    registry.set(normalized, loader);
  }
  if (normalized !== "/") {
    const trailing = `${normalized}/`;
    if (!registry.has(trailing)) {
      registry.set(trailing, loader);
    }
  }
}

type PrefetchOptions = {
  signal?: AbortSignal;
};

export async function prefetchRoute(
  path: string,
  options: PrefetchOptions = {}
): Promise<boolean> {
  const normalized = normalizePath(path);
  const loader = registry.get(normalized);
  if (!loader) return false;

  const { signal } = options;
  if (signal?.aborted) return false;

  let load = pendingLoads.get(normalized);
  if (!load) {
    load = loader().catch((error) => {
      if (import.meta.env?.DEV) {
        console.warn("[router] Unable to prefetch route", normalized, error);
      }
      throw error;
    });
    pendingLoads.set(
      normalized,
      load.finally(() => {
        pendingLoads.delete(normalized);
      })
    );
  }

  const awaited = pendingLoads.get(normalized);
  if (!awaited) return false;

  if (!signal) {
    try {
      await awaited;
      return true;
    } catch {
      return false;
    }
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;

    const finalize = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const handleAbort = () => {
      signal.removeEventListener("abort", handleAbort);
      finalize(false);
    };

    signal.addEventListener("abort", handleAbort, { once: true });

    awaited
      .then(() => {
        signal.removeEventListener("abort", handleAbort);
        finalize(!signal.aborted);
      })
      .catch(() => {
        signal.removeEventListener("abort", handleAbort);
        finalize(false);
      });

    if (signal.aborted) {
      handleAbort();
    }
  });
}
