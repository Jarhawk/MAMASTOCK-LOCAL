import { AuthProvider, useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}

export { AuthProvider };

export default useAuth;
