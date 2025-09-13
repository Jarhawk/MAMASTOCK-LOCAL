import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { MultiMamaProvider } from "@/context/MultiMamaContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import ToastRoot from "@/components/ToastRoot";
import DebugRibbon from "@/components/DebugRibbon";
import AppRouter from "@/router";
import nprogress from "nprogress";
import { testRandom } from "/src/shims/selftest";
import "./globals.css";
import "nprogress/nprogress.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      keepPreviousData: true,
    },
  },
});

function Root() {
  console.log("[debug] App mounted");
  useEffect(() => {
    testRandom().catch((err) =>
      console.error("crypto shim selftest failed", err)
    );
  }, []);
  useEffect(() => {
    nprogress.configure({ showSpinner: false });
    console.log("[debug] Frontend OK");
  }, []);
  useEffect(() => {
    const normalize = (e) => {
      if (e.target instanceof HTMLInputElement && e.target.type === "number") {
        if (e.target.value.includes(",")) {
          e.target.value = e.target.value.replace(",", ".");
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
            node
              .querySelectorAll?.('input[type="number"]')
              .forEach(applyAttrs);
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

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MultiMamaProvider>
          <ThemeProvider>
            <ToastRoot />
            <DebugRibbon />
            <AppRouter />
            <CookieConsent />
          </ThemeProvider>
        </MultiMamaProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
