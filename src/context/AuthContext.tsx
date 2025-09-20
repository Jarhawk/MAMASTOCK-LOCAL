/// <reference types="vite/client" />
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { readConfig, writeConfig } from "@/appFs";
import { DEFAULT_ROLES } from "@/constants/roles";
import { normalizeAccessKey } from "@/lib/access";
import { can } from "@/utils/permissions";

const AUTH_SESSION_KEY = "auth.user";

function readSessionUser(): NonNullable<User> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as NonNullable<User>;
    }
  } catch {}
  return null;
}

function writeSessionUser(user: NonNullable<User>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  } catch {}
}

function clearSessionUser() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  } catch {}
}

export type User = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  role?: string | null;
} | null;

type AccessRights = Record<string, any> | null;

type Ctx = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  role: string | null;
  roles: string[];
  user: User;
  userData: any;
  access_rights: AccessRights;
  devFakeAuth: boolean;
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
  access_rights: null,
  devFakeAuth: false,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  hasAccess: () => false
};

const AuthContext = createContext<Ctx>(defaultCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    const aliases: string[] = [];
    if (u.role) aliases.push(u.role);
    if (u.role === "chef_site") aliases.push("manager");
    if (u.role === "siege") aliases.push("admin");
    setUser({
      id: u.id ?? null,
      email: u.email ?? null,
      mama_id: u.mama_id ?? null,
      role: u.role ?? null
    });
    setUserData({ ...u, access_rights });
    setRoles(aliases.filter(Boolean));
    const persistedUser: NonNullable<User> = {
      id: u.id ?? null,
      email: u.email ?? null,
      mama_id: u.mama_id ?? null,
      role: u.role ?? null
    };
    writeSessionUser(persistedUser);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const stored = readSessionUser();
        if (stored) await loadUser(stored);
      } catch {}
      setLoading(false);
    })();
  }, [loadUser]);

  const signIn = useCallback(
    async (u: NonNullable<User>) => {
      await loadUser(u);
      setLoading(false);
    },
    [loadUser]
  );

  const signOut = useCallback(() => {
    setUser(null);
    setUserData(null);
    setRoles([]);
    clearSessionUser();
    setLoading(false);
  }, []);

  const safeUserData = useMemo(() => {
    if (userData) {
      return userData;
    }
    return null;
  }, [userData]);

  const resolvedAccessRights: AccessRights = useMemo(() => {
    if (safeUserData?.access_rights) return safeUserData.access_rights;
    return null;
  }, [safeUserData]);

  const resolvedUser: User = useMemo(() => {
    if (user) return user;
    if (safeUserData) {
      return {
        id: safeUserData.id ?? null,
        email: safeUserData.email ?? null,
        mama_id: safeUserData.mama_id ?? null,
        role: safeUserData.role ?? null
      };
    }
    return null;
  }, [safeUserData, user]);

  const resolvedRole = safeUserData?.role ?? resolvedUser?.role ?? null;

  const resolvedRoles = useMemo(() => {
    const base = new Set<string>();
    roles.forEach((r) => r && base.add(r));
    if (resolvedRole) base.add(resolvedRole);
    return Array.from(base);
  }, [resolvedRole, roles]);

  const hasAccess = useCallback(
    (key: string, action = "lecture") => {
      const normalized = normalizeAccessKey(key);
      return can(
        resolvedAccessRights || {},
        normalized,
        action,
        resolvedRole ?? null
      );
    },
    [resolvedAccessRights, resolvedRole]
  );

  const value = useMemo<Ctx>(
    () => ({
      id: resolvedUser?.id ?? null,
      email: resolvedUser?.email ?? null,
      mama_id: resolvedUser?.mama_id ?? null,
      role: resolvedRole ?? null,
      roles: resolvedRoles,
      user: resolvedUser,
      userData: safeUserData,
      access_rights: resolvedAccessRights,
      devFakeAuth: false,
      loading,
      signIn,
      signOut,
      hasAccess
    }),
    [
      hasAccess,
      loading,
      resolvedAccessRights,
      resolvedRole,
      resolvedRoles,
      resolvedUser,
      safeUserData,
      signIn,
      signOut
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
