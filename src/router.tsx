import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Familles from "@/pages/parametrage/Familles";
import SousFamilles from "@/pages/parametrage/SousFamilles";
import Unites from "@/pages/parametrage/Unites";
import DossierDonnees from "@/pages/DossierDonnees";
import AuthDebug from "@/pages/debug/AuthDebug";
import Sidebar from "@/components/Sidebar";
import { isTauri } from "@/lib/db/sql";

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
      { path: "parametrage/familles", element: <Familles /> },
      { path: "parametrage/sousfamilles", element: <SousFamilles /> },
      { path: "parametrage/unites", element: <Unites /> },
      { path: "dossierdonnees", element: <DossierDonnees /> },
      { path: "debug/authdebug", element: <AuthDebug /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

const router = isTauri ? createHashRouter(routes) : createBrowserRouter(routes);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
