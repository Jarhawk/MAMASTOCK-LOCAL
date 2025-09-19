import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PrivateOutlet from "./PrivateOutlet.jsx";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-zinc-900">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-white">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route element={<PrivateOutlet />}>
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
