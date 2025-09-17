// src/router.tsx
import React, { Suspense, lazy, useEffect } from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";

import { listLocalUsers } from "@/auth/localAccount";
import { routes } from "@/router.autogen";

const FirstRunSetupPage = lazy(() => import("@/pages/setup/FirstRun"));
const LocalAccountsPage = lazy(() => import("@/pages/parametrage/ComptesLocaux"));
const DatabaseSettingsPage = lazy(() => import("@/pages/Settings/Database"));

const router = createHashRouter([
  { path: "/setup", element: <FirstRunSetupPage /> },
  // routes autogen
  ...routes,
  { path: "/parametrage/base-de-donnees", element: <DatabaseSettingsPage /> },
  { path: "/parametrage/comptes-locaux", element: <LocalAccountsPage /> },
  // route par défaut ("/" => /dashboard si présent, sinon première route dispo)
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  // catch-all
  { path: "*", element: <Navigate to="/dashboard" replace /> }
]);

function useFirstRunRedirect() {
  useEffect(() => {
    let cancelled = false;

    const ensureSetupRoute = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash || "";
      const currentPath = hash.startsWith("#") ? hash.slice(1) : hash;
      if (!currentPath.startsWith("/setup")) {
        router.navigate("/setup", { replace: true });
      }
    };

    async function ensureAdminAccount() {
      try {
        const users = await listLocalUsers();
        if (cancelled) return;
        if (users.length === 0) {
          ensureSetupRoute();
        }
      } catch (error) {
        console.warn("[setup] Impossible de lire les comptes locaux", error);
        if (!cancelled) {
          ensureSetupRoute();
        }
      }
    }

    ensureAdminAccount();
    const unsubscribe = router.subscribe(() => {
      void ensureAdminAccount();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
}

export default function AppRouter() {
  useFirstRunRedirect();

  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Chargement…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
