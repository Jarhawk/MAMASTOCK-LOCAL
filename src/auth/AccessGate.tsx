import React from "react";

import { useAuth } from "@/context/AuthContext";
import { devFlags } from "@/lib/devFlags";

// Simple gate : en local, on autorise tout (fini les “Accès refusé”)
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const { user, access_rights } = useAuth();
  if (devFlags.isDev) return <>{children}</>;

  if (!user && !access_rights) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p>Aucun accès attribué, contactez l’administrateur.</p>
      </div>
    );
  }
  return <>{children}</>;
}
