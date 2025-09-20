import "@testing-library/jest-dom";

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

type GlobalWithObservers = typeof globalThis & {
  IntersectionObserver?: typeof IntersectionObserver;
  ResizeObserver?: typeof ResizeObserver;
};

const globalWithObservers = globalThis as GlobalWithObservers;

if (typeof globalWithObservers.IntersectionObserver === "undefined") {
  globalWithObservers.IntersectionObserver = NoopObserver as unknown as typeof IntersectionObserver;
}

if (typeof globalWithObservers.ResizeObserver === "undefined") {
  globalWithObservers.ResizeObserver = NoopObserver as unknown as typeof ResizeObserver;
}
