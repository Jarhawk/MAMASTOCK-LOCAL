import { useAuth as useAuthContext } from '@/context/AuthContext';import { isTauri } from "@/lib/runtime/isTauri";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;