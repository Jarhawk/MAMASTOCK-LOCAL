// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const defaultAuth = {
  user: null,
  mama_id: null,
  isAuthenticated: false,
  loading: true,
};

const AuthContext = createContext(defaultAuth);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
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

  const value = useMemo(() => {
    return {
      user,
      mama_id: user?.mama_id ?? null,
      isAuthenticated: !!user,
      loading,
      setUser,
      signIn: (u) => setUser(u),
      signOut: () => setUser(null),
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Always return a non-null object
  const ctx = useContext(AuthContext);
  return ctx || defaultAuth;
}
