import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import {
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
  useNavigationType
} from "react-router-dom";

import Spinner from "@/components/ui/Spinner";
import { useAnalyticsNavigationListener } from "@/services/analytics";

const NAVIGATION_EVENT = "app:navigation-complete";

function resolveLocationKey(location) {
  const fallback = `${location.pathname}${location.search}${location.hash}`;
  if (typeof window === "undefined") return location.key || fallback;
  const state = window.history.state;
  if (state && typeof state === "object" && typeof state.key === "string") {
    return state.key;
  }
  return location.key || fallback;
}

function useScrollAndFocusRestore() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigation = useNavigation();
  const positionsRef = useRef(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const storePosition = () => {
      const key = resolveLocationKey(location);
      positionsRef.current.set(key, {
        x: window.scrollX,
        y: window.scrollY
      });
    };
    window.addEventListener("scroll", storePosition, { passive: true });
    window.addEventListener("beforeunload", storePosition);
    storePosition();
    return () => {
      window.removeEventListener("scroll", storePosition);
      window.removeEventListener("beforeunload", storePosition);
      storePosition();
    };
  }, [location.hash, location.key, location.pathname, location.search]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = original;
      };
    }
    return undefined;
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const key = resolveLocationKey(location);
    if (navigationType === "POP") {
      const stored = positionsRef.current.get(key);
      if (stored && typeof stored.y === "number") {
        window.scrollTo({ left: stored.x ?? 0, top: stored.y });
        return;
      }
    }
    const hash = location.hash ? location.hash.slice(1) : "";
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [location.hash, location.key, location.pathname, location.search, navigationType]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const isSkipLink = location.hash === "#content";
    const shouldFocus =
      (navigationType !== "POP" && navigation.state === "idle") || isSkipLink;
    if (!shouldFocus) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const mainContent = document.getElementById("content");
      if (mainContent) {
        mainContent.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    location.hash,
    location.key,
    location.pathname,
    location.search,
    navigation.state,
    navigationType
  ]);
}

function useNavigationAnalyticsEvents() {
  const location = useLocation();
  const matches = useMatches();
  const navigation = useNavigation();
  const lastKey = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (navigation.state !== "idle") return;
    const key = resolveLocationKey(location);
    if (lastKey.current === key) return;
    lastKey.current = key;
    const detail = {
      path: `${location.pathname}${location.search}${location.hash}`,
      matches,
      title: typeof document !== "undefined" ? document.title : "",
      locationKey: key
    };
    window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail }));
  }, [location.hash, location.key, location.pathname, location.search, matches, navigation.state]);
}

export default function App() {
  useScrollAndFocusRestore();
  useNavigationAnalyticsEvents();
  useAnalyticsNavigationListener();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>
      <Suspense fallback={<Spinner label="Chargement de l’application…" />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
