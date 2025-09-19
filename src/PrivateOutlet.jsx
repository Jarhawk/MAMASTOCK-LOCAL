import { Outlet } from "react-router-dom";

import useAuth from "./hooks/useAuth";

export default function PrivateOutlet() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-zinc-500">
        Chargement de la session…
      </div>
    );
  }

  if (status === "signedout") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-lg font-semibold text-zinc-900">Connexion requise</div>
        <p className="max-w-sm text-sm text-zinc-600">
          Veuillez vous connecter pour accéder à cette section de MamaStock.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
