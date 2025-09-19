import React, { lazy } from "react";
import { createHashRouter, Navigate } from "react-router-dom";

import App from "./App";
import { routes as autoRoutes } from "@/router.autogen";

const FirstRunSetupPage = lazy(() => import("@/pages/setup/FirstRun"));
const LocalAccountsPage = lazy(() => import("@/pages/parametrage/ComptesLocaux"));

const normalizedRoutes = autoRoutes
  .filter((route) => route.path !== "/" && route.path !== "*")
  .map((route) => {
    const normalizedPath = route.path.startsWith("/")
      ? route.path.slice(1)
      : route.path;
    return { ...route, path: normalizedPath };
  });

export const appRouter = createHashRouter([
  {
    path: "/",
    element: <App />, // App is the root layout (Sidebar + Outlet)
    children: [
      { path: "setup", element: <FirstRunSetupPage /> },
      ...normalizedRoutes,
      { path: "parametrage/comptes-locaux", element: <LocalAccountsPage /> },
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> }
    ]
  }
]);

export default appRouter;
