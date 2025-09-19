import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <Spinner label="Chargement de votre session…" />;
  }

  if (status !== "authed") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
