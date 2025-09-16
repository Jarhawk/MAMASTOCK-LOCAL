import { useAuth } from './useAuth';import { isTauri } from "@/lib/tauriEnv";

export default function useAccess(module, right = 'peut_voir') {
  const { hasAccess, loading, pending, isSuperadmin } = useAuth();
  const allowed = module ? hasAccess(module, right) : false;
  const ready = !loading && !pending;
  return { allowed: isSuperadmin || allowed, loading: !ready };
}