// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import Router from "@/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nprogress from "nprogress";
import { useEffect, useState } from "react";
import { MultiMamaProvider } from "@/context/MultiMamaContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import ToastRoot from "@/components/ToastRoot";
import DebugRibbon from "@/components/DebugRibbon";
import { testRandom } from "/src/shims/selftest";
import { devFlags } from "@/lib/devFlags";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      keepPreviousData: true
    }
  }
});

export default function App() {
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  console.log("[debug] App mounted");

  useEffect(() => {
    console.info(
      `[dev] isDev=${devFlags.isDev} isTauri=${devFlags.isTauri} forceSidebar=${devFlags.forceSidebar} allowAllRoutes=${devFlags.allowAllRoutes}`
    );
    if (devFlags.isDev) {
      console.info("[dev] reasons", devFlags.reason);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !devFlags.isDev) return undefined;
    const handler = (event) => {
      if (event.ctrlKey && event.altKey && (event.key === "d" || event.key === "D")) {
        event.preventDefault();
        setDevPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    testRandom().catch((err) => console.error("crypto shim selftest failed", err));
  }, []);
  useEffect(() => {
    nprogress.configure({ showSpinner: false });
    console.log("[debug] Frontend OK");
  }, []);
  useEffect(() => {
    const normalize = (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.type === "number") {
        if (target.value.includes(",")) {
          target.value = target.value.replace(",", ".");
        }
      }
    };
    const applyAttrs = (el) => {
      if (el instanceof HTMLInputElement && el.type === "number") {
        el.setAttribute("inputmode", "decimal");
        el.setAttribute("pattern", "[0-9]*[.,]?[0-9]*");
      }
    };
    document.querySelectorAll('input[type="number"]').forEach(applyAttrs);
    const observer = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches('input[type="number"]')) applyAttrs(node);
            node.querySelectorAll?.('input[type="number"]').forEach(applyAttrs);
          }
        })
      );
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("change", normalize, true);
    return () => {
      document.removeEventListener("change", normalize, true);
      observer.disconnect();
    };
  }, []);

  const toggleOverride = (storageKey) => {
    if (typeof window === "undefined") return;
    try {
      const current = window.localStorage.getItem(storageKey) === "1";
      window.localStorage.setItem(storageKey, current ? "0" : "1");
    } catch (err) {
      console.warn(`[dev] Unable to persist ${storageKey}:`, err);
    }
    window.location.reload();
  };

  const devSnapshot =
    (typeof window !== "undefined" && window.__DEV_FLAGS__) || devFlags;

  return (
    <QueryClientProvider client={queryClient}>
      <MultiMamaProvider>
        <ThemeProvider>
          <ToastRoot />
          <DebugRibbon />
          <Router />
          <CookieConsent />
          {devFlags.isDev && devPanelOpen && (
            <div className="fixed bottom-20 left-4 z-[2147483646] max-w-sm rounded-lg border border-white/20 bg-black/80 p-4 text-white shadow-xl">
              <button
                type="button"
                className="absolute right-2 top-2 text-xs text-white/70 transition hover:text-white"
                onClick={() => setDevPanelOpen(false)}
              >
                ×
              </button>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Dev Overrides (Ctrl+Alt+D)
              </div>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/60 p-2 text-[11px] leading-tight whitespace-pre-wrap">
                {JSON.stringify(devSnapshot, null, 2)}
              </pre>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!devFlags.forceSidebar}
                    onChange={() => toggleOverride("DEV_FORCE_SIDEBAR")}
                  />
                  Force Sidebar
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!devFlags.allowAllRoutes}
                    onChange={() => toggleOverride("DEV_ALLOW_ALL_ROUTES")}
                  />
                  Allow All Routes
                </label>
              </div>
              <p className="mt-3 text-[11px] text-white/60">
                Les bascules sont stockées dans localStorage et la page se recharge automatiquement.
              </p>
            </div>
          )}
          {devFlags.isDev && (
            <div className="pointer-events-none fixed bottom-3 left-3 z-[2147483647] rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
              {`DEV • Sidebar: ${devFlags.reason.sidebar || "prod"} • Routes: ${devFlags.reason.routes || "prod"} • ${devFlags.isTauri ? "Tauri" : "Browser"}`}
            </div>
          )}
        </ThemeProvider>
      </MultiMamaProvider>
    </QueryClientProvider>
  );
}
