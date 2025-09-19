import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import RequireAuth from "@/auth/RequireAuth";
import { AppLayoutBoundary } from "@/layout/AppLayout";
import AppLayout from "@/layout/AppLayout";
import LegalLayout, { LegalLayoutBoundary } from "@/layout/LegalLayout";
import Spinner from "@/components/ui/Spinner";

const DashboardPage = lazy(() => import("@/pages/Dashboard.jsx"));
const LoginPage = lazy(() => import("@/pages/Login.jsx"));
const NotFoundPage = lazy(() => import("@/pages/NotFound.jsx"));
const SettingsPage = lazy(() => import("@/pages/Settings.jsx"));
const CguPage = lazy(() => import("@/pages/legal/Cgu.jsx"));
const CgvPage = lazy(() => import("@/pages/legal/Cgv.jsx"));
const ConfidentialitePage = lazy(() => import("@/pages/legal/Confidentialite.jsx"));
const ContactPage = lazy(() => import("@/pages/legal/Contact.jsx"));
const LicencePage = lazy(() => import("@/pages/legal/Licence.jsx"));
const MentionsLegalesPage = lazy(() => import("@/pages/legal/MentionsLegales.jsx"));
const RgpdPage = lazy(() => import("@/pages/Rgpd.jsx"));

function useScrollAndFocusRestore() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = original;
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash]);
}

export default function App() {
  useScrollAndFocusRestore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>
      <Suspense fallback={<Spinner label="Chargement de l’application…" />}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route
              element={
                <AppLayoutBoundary>
                  <AppLayout />
                </AppLayoutBoundary>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="login" element={<LoginPage />} />

          <Route
            element={
              <LegalLayoutBoundary>
                <LegalLayout />
              </LegalLayoutBoundary>
            }
          >
            <Route path="legal/cgu" element={<CguPage />} />
            <Route path="legal/cgv" element={<CgvPage />} />
            <Route path="legal/confidentialite" element={<ConfidentialitePage />} />
            <Route path="legal/contact" element={<ContactPage />} />
            <Route path="legal/licence" element={<LicencePage />} />
            <Route path="legal/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="legal/rgpd" element={<RgpdPage />} />
          </Route>

          <Route path="cgu" element={<Navigate to="/legal/cgu" replace />} />
          <Route path="cgv" element={<Navigate to="/legal/cgv" replace />} />
          <Route path="confidentialite" element={<Navigate to="/legal/confidentialite" replace />} />
          <Route path="contact" element={<Navigate to="/legal/contact" replace />} />
          <Route path="licence" element={<Navigate to="/legal/licence" replace />} />
          <Route path="mentions-legales" element={<Navigate to="/legal/mentions-legales" replace />} />
          <Route path="rgpd" element={<Navigate to="/legal/rgpd" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}
