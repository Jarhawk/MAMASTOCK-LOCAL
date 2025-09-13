import React from "react";

export type RouteItem = {
  path: string;
  label?: string;
  group?: string;
  // dynamic import path as string, used by lazy loader
  importPath: string;
};

export const autoRoutes: RouteItem[] = [
  // <-- rempli par le script
];

// util: convertir RouteItem[] en vrais éléments React Router
export function buildAutoElements() {
  const routes = autoRoutes.map(r => {
    const Page = React.lazy(() => import(/* @vite-ignore */ r.importPath));
    return { path: r.path, element: <React.Suspense fallback={null}><Page /></React.Suspense> };
  });
  routes.push({ path: "*", element: <div style={{padding:16}}>Page introuvable</div> });
  return routes;
}
