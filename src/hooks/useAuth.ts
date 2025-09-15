import { useAuth as useAuthContext } from '@/context/AuthContext';import { isTauri } from "@/lib/db/sql";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;