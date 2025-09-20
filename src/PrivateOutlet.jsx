import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { buildRedirectHash, setRedirectTo } from "@/auth/redirect";
import useAuth from "@/hooks/useAuth";

export default function PrivateOutlet() {
  const { status } = useAuth();
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
      <div className="flex h-full items-center justify-center p-6 text-sm text-foreground/60">
        Chargement de la session…
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to={loginTarget} replace />;
  }

  return <Outlet />;
}
