import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ roles = [], children }) {
  const { role } = useAuth();
  if (roles.length && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
