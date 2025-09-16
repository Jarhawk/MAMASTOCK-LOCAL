import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { shouldBypassAccessGuards } from "@/lib/runtime/devFlags";

export default function PrivateOutlet() {
  const { user, access_rights } = useAuth();
  const devBypass = shouldBypassAccessGuards();

  if (!devBypass && !user && !access_rights) return <Navigate to="/login" replace />;
  return <Outlet />;
}
