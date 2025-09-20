import React, { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { buildRedirectHash, setRedirectTo } from "@/auth/redirect";
import useAuth from "@/hooks/useAuth";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const { status, user, access_rights } = useAuth();
  const location = useLocation();
  const redirectHash = useMemo(() => buildRedirectHash(location), [location]);
  const loginTarget = useMemo(
    () => ({
      pathname: "/login",
      search: `?redirectTo=${encodeURIComponent(redirectHash)}`,
    }),
    [redirectHash]
  );

  useEffect(() => {
    if (status !== "authenticated") {
      setRedirectTo(redirectHash);
    }
  }, [redirectHash, status]);

  if (status === "loading") {
    return (
      <div className="p-8 text-sm text-foreground/60">Chargement de la session…</div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to={loginTarget} replace />;
  }

  if (!user && !access_rights) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p>Aucun accès attribué, contactez l’administrateur.</p>
      </div>
    );
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
