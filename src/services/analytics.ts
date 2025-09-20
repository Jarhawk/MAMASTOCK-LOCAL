// @ts-nocheck
import { isValidElement } from "react";
import type { RouteMatch } from "react-router-dom";
import { Navigate } from "react-router-dom";

export type AnalyticsPayload = Record<string, unknown> | undefined;

export function trackEvent(name: string, payload?: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  const detail = { name, payload: payload ?? {} };
  window.dispatchEvent(new CustomEvent("analytics:event", { detail }));
}

export type PageViewPayload = {
  path: string;
  routeId: string | null;
  title: string;
  ts: number;
  referrer: string | null;
};

export function trackPageView(payload: string | PageViewPayload) {
  if (typeof payload === "string") {
    trackEvent("page_view", { path: payload });
    return;
  }
  trackEvent("page_view", payload);
}

const NAVIGATION_EVENT = "app:navigation-complete";

type NavigationCompleteDetail = {
  path: string;
  matches: RouteMatch[];
  title: string;
  locationKey?: string;
};

let navigationListenerAttached = false;
let lastProcessedKey: string | null = null;
let lastPageViewPath: string | null = null;

function matchIsNavigate(match: RouteMatch) {
  const element = match.route?.element;
  return Boolean(isValidElement(element) && element.type === Navigate);
}

function matchIs404(match: RouteMatch) {
  const handle: any = match.route?.handle;
  if (handle && typeof handle === "object" && handle.isNotFound) {
    return true;
  }
  const data: any = match.data;
  if (data && typeof data === "object" && data.status === 404) {
    return true;
  }
  return false;
}

function resolveRouteId(match: RouteMatch) {
  if (match.route && typeof match.route.id === "string") {
    return match.route.id;
  }
  if (typeof match.id === "string") {
    return match.id;
  }
  return null;
}

function handleNavigationComplete(event: Event) {
  const customEvent = event as CustomEvent<NavigationCompleteDetail>;
  const detail = customEvent.detail;
  if (!detail) return;

  const { matches, path, title, locationKey } = detail;
  if (!Array.isArray(matches) || matches.length === 0) return;
  if (locationKey && lastProcessedKey === locationKey) return;

  const leaf = matches[matches.length - 1];
  if (!leaf) return;
  const signature = locationKey ?? path;
  if (matchIsNavigate(leaf) || matchIs404(leaf)) {
    lastProcessedKey = signature;
    return;
  }

  const payload: PageViewPayload = {
    path,
    routeId: resolveRouteId(leaf),
    title: title || (typeof document !== "undefined" ? document.title : ""),
    ts: Date.now(),
    referrer: lastPageViewPath
  };

  trackPageView(payload);
  lastPageViewPath = path;
  lastProcessedKey = signature;
}

if (typeof window !== "undefined" && !navigationListenerAttached) {
  window.addEventListener(NAVIGATION_EVENT, handleNavigationComplete as EventListener);
  navigationListenerAttached = true;
}
