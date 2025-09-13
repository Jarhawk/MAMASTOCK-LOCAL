import React from "react";
import type { RouteObject } from "react-router-dom";
const Page0 = React.lazy(() => import("./pages/Dashboard.jsx"));
const Page1 = React.lazy(() => import("./pages/parametrage/Familles.jsx"));
const Page3 = React.lazy(() => import("./pages/parametrage/Unites.jsx"));
const Missing = () => <div>NotFound: composant manquant</div>;

export const routes: RouteObject[] = [
  { path: "/", element: <React.Suspense fallback={null}><Page0 /></React.Suspense> },
  { path: "/dashboard", element: <React.Suspense fallback={null}><Page0 /></React.Suspense> },
  { path: "/parametrage/familles", element: <React.Suspense fallback={null}><Page1 /></React.Suspense> },
  { path: "/parametrage/sousfamilles", element: <React.Suspense fallback={null}><Missing /></React.Suspense> },
  { path: "/parametrage/unites", element: <React.Suspense fallback={null}><Page3 /></React.Suspense> },
  { path: "/dossierdonnees", element: <React.Suspense fallback={null}><Missing /></React.Suspense> },
  { path: "/debug/authdebug", element: <React.Suspense fallback={null}><Missing /></React.Suspense> }
];

export default routes;
