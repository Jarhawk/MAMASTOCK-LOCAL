// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { registerSql, loginSql } from "@/auth/sqlAccount";
type User = { id: string; email?: string; mama_id: string };

type Ctx = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (u: User) => void;
  signOut: () => void;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
};

const defaultAuth: Ctx = {
  id: null,
  email: null,
  mama_id: null,
  user: null,
  isAuthenticated: false,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  register: async () => {},
  login: async () => {},
};

const AuthContext = createContext<Ctx>(defaultAuth);

export function AuthProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // DEV fallback: if no user and VITE_FAKE_AUTH=1, inject a fake user
        const useFake = import.meta?.env?.VITE_FAKE_AUTH === "1";
        const bootUser = initialUser ?? (useFake ? { id: "dev-user", mama_id: "local-dev" } : null);
        if (!cancelled) {
          setUser(bootUser);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [initialUser]);

  const value = useMemo<Ctx>(() => ({
    id: user?.id ?? null,
    email: user?.email ?? null,
    mama_id: user?.mama_id ?? null,
    user,
    isAuthenticated: !!user,
    loading,
    signIn: (u) => setUser(u),
    signOut: () => setUser(null),
    register: async (email, password) => {
      const u = await registerSql(email, password);
      setUser(u);
    },
    login: async (email, password) => {
      const u = await loginSql(email, password);
      setUser(u);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Always return a non-null object
  const ctx = useContext(AuthContext);
  return ctx || defaultAuth;
}
