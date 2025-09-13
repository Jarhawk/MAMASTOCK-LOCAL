import React from "react";
import { useAuth } from "@/context/AuthContext";

function isLocal() {
  return !!(window as any).__TAURI__ || !!import.meta.env.TAURI_PLATFORM;
}

// Simple gate : en local, on autorise tout (fini les “Accès refusé”)
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (isLocal()) return <>{children}</>;

  // Si un jour tu veux remettre RBAC web:
  // const allowed = hasAccess(user, requiredPerms);
  // if (!allowed) ...

  if (!user) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p>Aucun accès attribué, contactez l’administrateur.</p>
      </div>
    );
  }
  return <>{children}</>;
}
