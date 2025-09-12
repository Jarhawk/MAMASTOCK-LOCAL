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
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

const router = isTauri ? createHashRouter(routes) : createBrowserRouter(routes);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
