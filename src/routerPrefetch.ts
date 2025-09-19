export type RoutePrefetcher = () => Promise<unknown>;

const registry = new Map<string, RoutePrefetcher>();

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

export async function prefetchRoute(path: string) {
  const normalized = normalizePath(path);
  const loader = registry.get(normalized);
  if (!loader) return;
  try {
    await loader();
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn("[router] Unable to prefetch route", normalized, error);
    }
  }
}
