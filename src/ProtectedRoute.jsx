import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { buildRedirectHash, setRedirectTo } from "@/auth/redirect";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
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
      <div className="flex min-h-[240px] items-center justify-center p-6 text-sm text-foreground/60">
        Chargement de votre session…
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to={loginTarget} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
