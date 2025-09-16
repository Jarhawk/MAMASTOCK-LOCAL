import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';import { isTauri } from "@/lib/tauriEnv";

export default function PrivateOutlet() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}