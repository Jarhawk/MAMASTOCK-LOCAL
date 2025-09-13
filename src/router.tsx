import { createHashRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Unites from "@/pages/parametrage/Unites";
import Familles from "@/pages/parametrage/Familles";
import SousFamilles from "@/pages/parametrage/SousFamilles";
import DossierDonnees from "@/pages/DossierDonnees";

const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "parametrage/unites", element: <Unites /> },
      { path: "parametrage/familles", element: <Familles /> },
      { path: "parametrage/sous-familles", element: <SousFamilles /> },
      { path: "data", element: <DossierDonnees /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
