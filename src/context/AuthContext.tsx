import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = { id: string; email: string; mama_id: string };

type Ctx = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (u: User) => void;
  signOut: () => void;
};

const defaultAuth: Ctx = {
  id: null,
  email: null,
  mama_id: null,
  user: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
};

const AuthContext = createContext<Ctx>(defaultAuth);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const useFake = import.meta?.env?.VITE_FAKE_AUTH === "1";
    if (useFake) {
      setUser({ id: "dev-user", email: "dev@example.com", mama_id: "local-dev" });
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      id: user?.id ?? null,
      email: user?.email ?? null,
      mama_id: user?.mama_id ?? null,
      user,
      isAuthenticated: !!user,
      signIn: (u: User) => setUser(u),
      signOut: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

