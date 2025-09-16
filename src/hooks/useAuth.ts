import { useAuth as useAuthContext } from '@/context/AuthContext';import { isTauri } from "@/lib/tauriEnv";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;