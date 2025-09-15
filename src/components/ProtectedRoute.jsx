// src/components/ProtectedRoute.jsx
import { Outlet } from "react-router-dom";import { isTauri } from "@/lib/runtime/isTauri";
export default function ProtectedRoute() {
  // No-op : rend systématiquement les enfants
  return <Outlet />;
}