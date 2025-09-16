import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function PrivateOutlet() {
  const { user, access_rights } = useAuth();
  const devBypass =
    import.meta.env.DEV &&
    (import.meta.env.VITE_DEV_FAKE_AUTH === "1" || import.meta.env.VITE_DEV_FORCE_SIDEBAR === "1");

  if (!user && !access_rights && !devBypass) return <Navigate to="/login" replace />;
  return <Outlet />;
}