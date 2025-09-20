import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import { buildRedirectHash, setRedirectTo } from "@/auth/redirect";

export default function RequireAuth({ roles = [] }) {
  const { status, roles: userRoles } = useAuth();
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
    return <Spinner label="Chargement de votre session…" />;
  }

  if (status !== "authenticated") {
    return <Navigate to={loginTarget} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to={loginTarget} replace />;
    }
  }

  return <Outlet />;
}
