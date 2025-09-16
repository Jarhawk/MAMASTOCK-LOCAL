// src/router.tsx
import React, { Suspense } from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { routes } from "@/router.autogen";import { isTauri } from "@/lib/tauriEnv";

const router = createHashRouter([
// routes autogen
...routes,
// route par défaut ("/" => /dashboard si présent, sinon première route dispo)
{ path: "/", element: <Navigate to="/dashboard" replace /> },
// catch-all
{ path: "*", element: <Navigate to="/dashboard" replace /> }]
);

export default function AppRouter() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Chargement…</div>}>
      <RouterProvider router={router} />
    </Suspense>);

}