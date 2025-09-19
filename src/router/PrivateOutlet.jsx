import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { devFlags } from "@/lib/devFlags";

export default function PrivateOutlet() {
  const { user, access_rights, loading } = useAuth();
  if (devFlags.isDev) {
    return <Outlet />;
  }
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm">
        Chargement de la session…
      </div>
    );
  }
  if (!user && !access_rights) return <Navigate to="/login" replace />;
  return <Outlet />;
}
