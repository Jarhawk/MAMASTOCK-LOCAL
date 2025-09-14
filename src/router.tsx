import React from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { routes } from "@/router.autogen";

/** Chemin fallback par défaut si présent dans la config auto */
const DEFAULT_PATH = "/dashboard";

/** Choisit un chemin de secours valide à partir des routes autogénérées */
function firstPathOrDefault(): string {
  try {
    // On préfère /dashboard s'il existe
    const hasDashboard =
      routes.some((r: any) => typeof r?.path === "string" && (r.path === "/dashboard" || r.path === "dashboard"));
    if (hasDashboard) return "/dashboard";

    // Sinon 1er path déclaré
    const first = routes.find((r: any) => typeof r?.path === "string" && r.path.length > 0);
    if (first) return first.path.startsWith("/") ? first.path : `/${first.path}`;
  } catch {}
  return DEFAULT_PATH;
}

const router = createHashRouter([
  // Redirige la racine vers un écran valide
  { path: "/", element: <Navigate to={firstPathOrDefault()} replace /> },

  // Routes autogénérées par nav:gen
  ...routes,

  // Filet de sécurité
  { path: "*", element: <Navigate to={firstPathOrDefault()} replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

