import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function RequireAuth({ roles = [] }) {
  const { status, roles: userRoles } = useAuth();
  const location = useLocation();
  const rawTarget = `${location.pathname}${location.search}` || "/dashboard";
  const redirectTarget = rawTarget === "/" ? "/dashboard" : rawTarget;
  const loginPath = `/login?redirectTo=${encodeURIComponent(redirectTarget)}`;

  if (status === "loading") {
    return <Spinner label="Chargement de votre session…" />;
  }

  if (status !== "authed") {
    return <Navigate to={loginPath} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to={loginPath} replace />;
    }
  }

  return <Outlet />;
}
