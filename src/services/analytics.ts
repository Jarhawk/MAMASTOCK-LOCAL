export type AnalyticsPayload = Record<string, unknown> | undefined;

export function trackEvent(name: string, payload?: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  const detail = { name, payload: payload ?? {} };
  window.dispatchEvent(new CustomEvent("analytics:event", { detail }));
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}
