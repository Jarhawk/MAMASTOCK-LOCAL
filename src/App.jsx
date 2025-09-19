import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./AppShell";
import PrivateOutlet from "./PrivateOutlet.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Settings from "./pages/Settings.jsx";
import LegalLayout from "@/layout/LegalLayout";
import Cgu from "@/pages/legal/Cgu";
import Cgv from "@/pages/legal/Cgv";
import Confidentialite from "@/pages/legal/Confidentialite";
import Contact from "@/pages/legal/Contact";
import Licence from "@/pages/legal/Licence";
import MentionsLegales from "@/pages/legal/MentionsLegales";
import Rgpd from "@/pages/Rgpd";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
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

      <Route path="login" element={<Login />} />

      <Route element={<LegalLayout />}>
        <Route path="legal/cgu" element={<Cgu />} />
        <Route path="legal/cgv" element={<Cgv />} />
        <Route
          path="legal/confidentialite"
          element={<Confidentialite />}
        />
        <Route path="legal/contact" element={<Contact />} />
        <Route path="legal/licence" element={<Licence />} />
        <Route
          path="legal/mentions-legales"
          element={<MentionsLegales />}
        />
        <Route path="rgpd" element={<Rgpd />} />
      </Route>
    </Routes>
  );
}
