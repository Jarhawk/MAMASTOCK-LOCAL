import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Familles from "@/pages/parametrage/Familles";
import SousFamilles from "@/pages/parametrage/SousFamilles";
import Unites from "@/pages/parametrage/Unites";
import DataFolder from "@/pages/parametrage/DataFolder";
import AuthDebug from "@/pages/debug/AuthDebug";
import Sidebar from "@/components/Sidebar";

const isTauri = !!import.meta.env.TAURI_PLATFORM;

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

const routes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "parametrage/familles", element: <Familles /> },
      { path: "parametrage/sous-familles", element: <SousFamilles /> },
      { path: "parametrage/unites", element: <Unites /> },
      { path: "parametrage/dossier-donnees", element: <DataFolder /> },
      { path: "debug/auth", element: <AuthDebug /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

const router = isTauri ? createHashRouter(routes) : createBrowserRouter(routes);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
