import React from "react";
import { useAuth } from "@/context/AuthContext";
import { isTauri } from "@/lib/tauriEnv";

// Simple gate : en local, on autorise tout (fini les “Accès refusé”)
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const { user, access_rights } = useAuth();
  if (isTauri()) return <>{children}</>;

  // Si un jour tu veux remettre RBAC web:
  // const allowed = hasAccess(user, requiredPerms);
  // if (!allowed) ...

  const devBypass =
    import.meta.env.DEV &&
    (import.meta.env.VITE_DEV_FAKE_AUTH === "1" || import.meta.env.VITE_DEV_FORCE_SIDEBAR === "1");

  if (!user && !access_rights && !devBypass) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p>Aucun accès attribué, contactez l’administrateur.</p>
      </div>
    );
  }
  return <>{children}</>;
}
