// src/auth/authAdapter.ts
import { loginLocal, registerLocal } from "@/auth/localAccount";
import { useAuth } from "@/context/AuthContext";import { isTauri } from "@/lib/runtime/isTauri";

export function useAuthAdapter() {
  const { signIn, signOut, user } = useAuth();

  return {
    user,
    async login(email: string, password: string) {
      const u = await loginLocal(email, password);
      signIn({ id: u.id, email: u.email, mama_id: u.mama_id });
      return u;
    },
    async register(email: string, password: string) {
      const u = await registerLocal(email, password);
      signIn({ id: u.id, email: u.email, mama_id: u.mama_id });
      return u;
    },
    logout() {
      signOut();
    }
  };
}