import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

function Shell() {
  return (
    <div className="min-h-screen w-full flex">
      <aside className="hidden md:flex w-64 shrink-0 border-r">
        <Sidebar />
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
