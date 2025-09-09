import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { registerSql, loginSql } from "@/auth/sqlAccount";

type User = { id: string; email: string; mama_id: string };

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

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const useFake = import.meta?.env?.VITE_FAKE_AUTH === "1";
        const bootUser = initialUser ?? (useFake ? { id: "dev-user", email: "dev@example.com", mama_id: "local-dev" } : null);
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
    signIn: (u: User) => setUser(u),
    signOut: () => setUser(null),
    register: async (email: string, password: string) => {
      const u = await registerSql(email, password);
      setUser(u);
    },
    login: async (email: string, password: string) => {
      const u = await loginSql(email, password);
      setUser(u);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
