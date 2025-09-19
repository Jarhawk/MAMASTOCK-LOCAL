import React, { lazy } from "react";
import { createHashRouter, Navigate } from "react-router-dom";

import App from "./App";
import RequireAuth from "@/auth/RequireAuth";
import AppLayout, { AppLayoutBoundary } from "@/layout/AppLayout";
import LegalLayout, { LegalLayoutBoundary } from "@/layout/LegalLayout";
import { routes as autoRoutes } from "@/router.autogen";
import { registerRoutePrefetch } from "@/routerPrefetch";

const importFirstRunSetupPage = () =>
  import(
    /* webpackChunkName: "page-pages-setup-firstrun" */ "@/pages/setup/FirstRun"
  );
registerRoutePrefetch("/setup", importFirstRunSetupPage);
registerRoutePrefetch("/setup/firstrun", importFirstRunSetupPage);
const FirstRunSetupPage = lazy(importFirstRunSetupPage);

const importLoginPage = () =>
  import(/* webpackChunkName: "page-pages-login" */ "@/pages/Login.jsx");
registerRoutePrefetch("/login", importLoginPage);
const LoginPage = lazy(importLoginPage);

const importSettingsPage = () =>
  import(/* webpackChunkName: "page-pages-settings" */ "@/pages/Settings.jsx");
registerRoutePrefetch("/settings", importSettingsPage);
const SettingsPage = lazy(importSettingsPage);

const importNotFoundPage = () =>
  import(/* webpackChunkName: "page-pages-notfound" */ "@/pages/NotFound.jsx");
const NotFoundPage = lazy(importNotFoundPage);

const importCguPage = () =>
  import(/* webpackChunkName: "page-pages-legal-cgu" */ "@/pages/legal/Cgu.jsx");
registerRoutePrefetch("/legal/cgu", importCguPage);
const CguPage = lazy(importCguPage);

const importCgvPage = () =>
  import(/* webpackChunkName: "page-pages-legal-cgv" */ "@/pages/legal/Cgv.jsx");
registerRoutePrefetch("/legal/cgv", importCgvPage);
const CgvPage = lazy(importCgvPage);

const importConfidentialitePage = () =>
  import(
    /* webpackChunkName: "page-pages-legal-confidentialite" */ "@/pages/legal/Confidentialite.jsx"
  );
registerRoutePrefetch("/legal/confidentialite", importConfidentialitePage);
const ConfidentialitePage = lazy(importConfidentialitePage);

const importContactPage = () =>
  import(/* webpackChunkName: "page-pages-legal-contact" */ "@/pages/legal/Contact.jsx");
registerRoutePrefetch("/legal/contact", importContactPage);
const ContactPage = lazy(importContactPage);

const importLicencePage = () =>
  import(/* webpackChunkName: "page-pages-legal-licence" */ "@/pages/legal/Licence.jsx");
registerRoutePrefetch("/legal/licence", importLicencePage);
const LicencePage = lazy(importLicencePage);

const importMentionsLegalesPage = () =>
  import(
    /* webpackChunkName: "page-pages-legal-mentionslegales" */ "@/pages/legal/MentionsLegales.jsx"
  );
registerRoutePrefetch("/legal/mentions-legales", importMentionsLegalesPage);
registerRoutePrefetch("/legal/mentionslegales", importMentionsLegalesPage);
const MentionsLegalesPage = lazy(importMentionsLegalesPage);

const importRgpdPage = () =>
  import(/* webpackChunkName: "page-pages-rgpd" */ "@/pages/Rgpd.jsx");
registerRoutePrefetch("/legal/rgpd", importRgpdPage);
const RgpdPage = lazy(importRgpdPage);

const LEGACY_REDIRECTS = [
  { from: "cgu", to: "/legal/cgu" },
  { from: "cgv", to: "/legal/cgv" },
  { from: "confidentialite", to: "/legal/confidentialite" },
  { from: "contact", to: "/legal/contact" },
  { from: "licence", to: "/legal/licence" },
  { from: "mentions", to: "/legal/mentions-legales" },
  { from: "mentions-legales", to: "/legal/mentions-legales" },
  { from: "rgpd", to: "/legal/rgpd" },
  { from: "parametrage/comptes-locaux", to: "/parametrage/compteslocaux" },
  { from: "setup/firstrun", to: "/setup" }
];

function createLegacyRoutes(entries: Array<{ from: string; to: string }>) {
  return entries.flatMap(({ from, to }) => {
    const normalized = from.startsWith("/") ? from.slice(1) : from;
    const base = {
      path: normalized,
      element: <Navigate to={to} replace />
    };
    if (normalized.endsWith("/")) return [base];
    return [
      base,
      {
        path: `${normalized}/`,
        element: <Navigate to={to} replace />
      }
    ];
  });
}

const EXCLUDED_ROUTES = new Set([
  "/",
  "*",
  "/login",
  "/notfound",
  "/cgu",
  "/cgv",
  "/confidentialite",
  "/contact",
  "/licence",
  "/mentions",
  "/mentions-legales",
  "/legal/cgu",
  "/legal/cgv",
  "/legal/confidentialite",
  "/legal/contact",
  "/legal/licence",
  "/legal/mentionslegales",
  "/legal/rgpd",
  "/rgpd",
  "/setup/firstrun"
]);

const normalizedRoutes = autoRoutes
  .filter((route) => !EXCLUDED_ROUTES.has(route.path))
  .map((route) => {
    const normalizedPath = route.path.startsWith("/")
      ? route.path.slice(1)
      : route.path;
    return { ...route, path: normalizedPath };
  });

export const appRouter = createHashRouter([
  {
    id: "root",
    path: "/",
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          {
            element: (
              <AppLayoutBoundary>
                <AppLayout />
              </AppLayoutBoundary>
            ),
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              ...normalizedRoutes,
              { path: "settings", element: <SettingsPage /> }
            ]
          }
        ]
      },
      { path: "setup", element: <FirstRunSetupPage /> },
      { path: "login", element: <LoginPage /> },
      {
        element: (
          <LegalLayoutBoundary>
            <LegalLayout />
          </LegalLayoutBoundary>
        ),
        children: [
          { path: "legal/cgu", element: <CguPage /> },
          { path: "legal/cgv", element: <CgvPage /> },
          { path: "legal/confidentialite", element: <ConfidentialitePage /> },
          { path: "legal/contact", element: <ContactPage /> },
          { path: "legal/licence", element: <LicencePage /> },
          { path: "legal/mentions-legales", element: <MentionsLegalesPage /> },
          { path: "legal/rgpd", element: <RgpdPage /> }
        ]
      },
      ...createLegacyRoutes(LEGACY_REDIRECTS),
      { path: "*", element: <NotFoundPage />, handle: { isNotFound: true } }
    ]
  }
]);

export default appRouter;
