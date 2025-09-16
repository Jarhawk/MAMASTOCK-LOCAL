import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { devFlags } from "@/lib/devFlags";

export default function PrivateOutlet() {
  const { user, access_rights } = useAuth();
  if (devFlags.isDev) {
    return <Outlet />;
  }
  if (!user && !access_rights) return <Navigate to="/login" replace />;
  return <Outlet />;
}
