import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';import { isTauri } from "@/lib/runtime/isTauri";

export default function PrivateOutlet() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}