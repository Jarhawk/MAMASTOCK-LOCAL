/// <reference types="vite/client" />
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
"react";
import { readConfig, writeConfig } from "@/appFs";
import { normalizeAccessKey } from "@/lib/access";
import { can } from "@/utils/permissions";
import { DEFAULT_ROLES } from "@/constants/roles";import { isTauri } from "@/lib/db/sql";

export type User = {id: string;email: string;mama_id: string;role: string;} | null;

type Ctx = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  role: string | null;
  roles: string[];
  user: User;
  userData: any;
  loading: boolean;
  signIn: (u: NonNullable<User>) => Promise<void> | void;
  signOut: () => void;
  hasAccess: (k: string, action?: string) => boolean;
};

const defaultCtx: Ctx = {
  id: null,
  email: null,
  mama_id: null,
  role: null,
  roles: [],
  user: null,
  userData: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  hasAccess: () => false
};

const AuthContext = createContext<Ctx>(defaultCtx);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User>(null);
  const [userData, setUserData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (u: NonNullable<User>) => {
    const cfg = (await readConfig()) || {};
    if (!cfg.roles || !Array.isArray(cfg.roles) || cfg.roles.length === 0) {
      cfg.roles = DEFAULT_ROLES;
      await writeConfig(cfg);
    }
    const roleDef = (cfg.roles || []).find((r: any) => r.id === u.role);
    const access_rights = roleDef?.access_rights || {};
    const aliases: string[] = [u.role];
    if (u.role === "chef_site") aliases.push("manager");
    if (u.role === "siege") aliases.push("admin");
    setUser(u);
    setUserData({ ...u, access_rights });
    setRoles(aliases);
    try {localStorage.setItem("auth.user", JSON.stringify(u));} catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("auth.user");
        if (raw) {
          const parsed = JSON.parse(raw);
          await loadUser(parsed);
        }
      } catch {}
      setLoading(false);
    })();
  }, [loadUser]);

  const signIn = useCallback(async (u: NonNullable<User>) => {
    await loadUser(u);
    setLoading(false);
  }, [loadUser]);

  const signOut = useCallback(() => {
    setUser(null);
    setUserData(null);
    setRoles([]);
    try {localStorage.removeItem("auth.user");} catch {}
  }, []);

  const hasAccess = useCallback(
    (key: string, action = "lecture") => {
      const k = normalizeAccessKey(key);
      return can(userData?.access_rights || {}, k, action, userData?.role);
    },
    [userData]
  );

  const value = useMemo<Ctx>(() => ({
    id: user?.id ?? null,
    email: user?.email ?? null,
    mama_id: user?.mama_id ?? null,
    role: userData?.role ?? null,
    roles,
    user,
    userData,
    loading,
    signIn,
    signOut,
    hasAccess
  }), [user, userData, roles, loading, signIn, signOut, hasAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}