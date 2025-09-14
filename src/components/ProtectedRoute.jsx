// src/components/ProtectedRoute.jsx
import { Outlet } from "react-router-dom";
export default function ProtectedRoute() {
  // No-op : rend systématiquement les enfants
  return <Outlet />;
}
