import { Outlet } from "react-router-dom";

import useAuth from "./hooks/useAuth";

export default function PrivateOutlet() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-foreground/60">
        Chargement de la session…
      </div>
    );
  }

  if (status === "signedout") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center text-base font-medium text-foreground/80">
          Veuillez vous connecter pour accéder à cette section.
        </div>
      </div>
    );
  }

  return <Outlet />;
}
