import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import AccessGate from "@/auth/AccessGate"; // créé en §4
import Loading from "@/ui/Loading"; // spinner existant ou simple div

// Utilitaire: essaie plusieurs chemins/extensions sans planter
function lazyAny(paths: string[]) {
  return lazy(async () => {
    for (const p of paths) {
      try { return await import(/* @vite-ignore */ p); } catch { /* try next */ }
    }
    // Fallback composant minimal
    return { default: () => <div className="p-4">Écran non disponible: {paths[0]}</div> };
  });
}

const Dashboard        = lazyAny(["@/pages/Dashboard.jsx", "@/pages/Dashboard.tsx"]);
const Produits         = lazyAny(["@/pages/produits/Produits.jsx", "@/pages/Produits.jsx"]);
const Fournisseurs     = lazyAny(["@/pages/fournisseurs/Fournisseurs.jsx"]);
const Factures         = lazyAny(["@/pages/factures/Factures.jsx"]);
const MenusJour        = lazyAny(["@/pages/menus/MenuDuJour.jsx"]);
const Recettes         = lazyAny(["@/pages/recettes/Recettes.jsx"]);
const FichesTech       = lazyAny(["@/pages/recettes/FichesTechniques.jsx"]);
const CoutsNourriture  = lazyAny(["@/pages/couts/CoutNourriture.jsx"]);
const CoutsBoisson     = lazyAny(["@/pages/couts/CoutBoisson.jsx"]);
const Inventaires      = lazyAny(["@/pages/inventaires/Inventaires.jsx"]);
const InventaireZones  = lazyAny(["@/pages/inventaires/Zones.jsx"]);
const Requisitions     = lazyAny(["@/pages/requisitions/Requisitions.jsx"]);
const AchatsRecommandes= lazyAny(["@/pages/achats/AchatsRecommandes.jsx"]);
const Taches           = lazyAny(["@/pages/taches/Taches.jsx"]);
const ParamFamilles    = lazyAny(["@/pages/parametrage/Familles.jsx", "@/pages/Parametrage/Familles.tsx"]);
const ParamSousFam     = lazyAny(["@/pages/parametrage/SousFamilles.jsx", "@/pages/Parametrage/SousFamilles.tsx"]);
const ParamUnites      = lazyAny(["@/pages/parametrage/Unites.jsx", "@/pages/Parametrage/Unites.tsx"]);
const DataFolder       = lazyAny(["@/pages/DossierDonnees.jsx", "@/pages/parametrage/DossierDonnees.jsx"]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },

      { path: "produits", element: <AccessGate><Produits /></AccessGate> },
      { path: "fournisseurs", element: <AccessGate><Fournisseurs /></AccessGate> },
      { path: "factures", element: <AccessGate><Factures /></AccessGate> },

      { path: "menus/jour", element: <AccessGate><MenusJour /></AccessGate> },
      { path: "recettes", element: <AccessGate><Recettes /></AccessGate> },
      { path: "recettes/fiches", element: <AccessGate><FichesTech /></AccessGate> },

      { path: "couts/nourriture", element: <AccessGate><CoutsNourriture /></AccessGate> },
      { path: "couts/boisson", element: <AccessGate><CoutsBoisson /></AccessGate> },

      { path: "inventaires", element: <AccessGate><Inventaires /></AccessGate> },
      { path: "inventaires/zones", element: <AccessGate><InventaireZones /></AccessGate> },
      { path: "requisitions", element: <AccessGate><Requisitions /></AccessGate> },

      { path: "achats-recommandes", element: <AccessGate><AchatsRecommandes /></AccessGate> },
      { path: "taches", element: <AccessGate><Taches /></AccessGate> },

      { path: "parametrage/familles", element: <AccessGate><ParamFamilles /></AccessGate> },
      { path: "parametrage/sous-familles", element: <AccessGate><ParamSousFam /></AccessGate> },
      { path: "parametrage/unites", element: <AccessGate><ParamUnites /></AccessGate> },
      { path: "parametrage/dossier-donnees", element: <AccessGate><DataFolder /></AccessGate> },
    ],
  },
  { path: "*", element: <div className="p-4">Page inconnue</div> },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
