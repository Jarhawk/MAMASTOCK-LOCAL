import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import {
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
  useNavigationType
} from "react-router-dom";

import Spinner from "@/components/ui/Spinner";
import { trackPageView } from "@/services/analytics";

function useScrollAndFocusRestore() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positionsRef = useRef(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const update = () => {
      const key = location.key || `${location.pathname}${location.search}${location.hash}`;
      positionsRef.current.set(key, window.scrollY);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      update();
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
    const key = location.key || `${location.pathname}${location.search}${location.hash}`;
    if (navigationType === "POP") {
      const stored = positionsRef.current.get(key);
      if (typeof stored === "number") {
        window.scrollTo({ top: stored });
        return;
      }
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [location.hash, location.key, location.pathname, location.search, navigationType]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (navigationType === "POP") return undefined;
    const frame = window.requestAnimationFrame(() => {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key, location.pathname, location.search, navigationType]);
}

function usePageViewAnalytics() {
  const location = useLocation();
  const matches = useMatches();
  const navigation = useNavigation();
  const lastReported = useRef(null);

  useEffect(() => {
    if (navigation.state !== "idle") return;
    const path = `${location.pathname}${location.search}${location.hash}`;
    if (lastReported.current === path) return;
    const isNotFound = matches.some((match) => match.handle?.isNotFound);
    lastReported.current = path;
    if (isNotFound) return;
    trackPageView(path);
  }, [location.hash, location.pathname, location.search, matches, navigation.state]);
}

export default function App() {
  useScrollAndFocusRestore();
  usePageViewAnalytics();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
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
