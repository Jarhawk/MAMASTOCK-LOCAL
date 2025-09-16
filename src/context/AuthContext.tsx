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
import { normalizeAccessKey } from "@/lib/access";
import { can } from "@/utils/permissions";
import { DEFAULT_ROLES } from "@/constants/roles";
import { devFlags } from "@/lib/devFlags";

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

const DEV_ACCESS_RIGHTS: any = new Proxy(
  {},
  {
    get: () => true
  }
);

const DEV_USER_DATA = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "dev@local",
  nom: "Dev",
  mama_id: "dev-local",
  role: "admin",
  actif: true,
  access_rights: DEV_ACCESS_RIGHTS
} as const;

const DEV_USER = {
  id: DEV_USER_DATA.id,
  email: DEV_USER_DATA.email,
  mama_id: DEV_USER_DATA.mama_id,
  role: DEV_USER_DATA.role
} as const;

const defaultCtx: Ctx = {
  id: null,
  email: null,
  mama_id: null,
  role: null,
  roles: [],
  user: null,
  userData: null,
  access_rights: null,
  devFakeAuth: devFlags.isDev,
  loading: devFlags.isDev ? false : true,
  signIn: () => {},
  signOut: () => {},
  hasAccess: () => devFlags.isDev
};

const AuthContext = createContext<Ctx>(defaultCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [userData, setUserData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(!devFlags.isDev);

  const devBypass = devFlags.isDev;

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
    try {
      localStorage.setItem("auth.user", JSON.stringify(u));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
    try {
      localStorage.removeItem("auth.user");
    } catch {}
    setLoading(!devFlags.isDev);
  }, []);

  const safeUserData = useMemo(() => {
    if (userData) {
      if (devBypass && !userData.access_rights) {
        return { ...userData, access_rights: DEV_ACCESS_RIGHTS };
      }
      return userData;
    }
    if (devBypass) {
      return DEV_USER_DATA;
    }
    return null;
  }, [devBypass, userData]);

  const resolvedAccessRights: AccessRights = useMemo(() => {
    if (safeUserData?.access_rights) return safeUserData.access_rights;
    if (devBypass) return DEV_ACCESS_RIGHTS;
    return null;
  }, [devBypass, safeUserData]);

  const resolvedUser: User = useMemo(() => {
    if (user) return user;
    if (safeUserData) {
      return {
        id: safeUserData.id ?? DEV_USER.id,
        email: safeUserData.email ?? DEV_USER.email,
        mama_id: safeUserData.mama_id ?? DEV_USER.mama_id,
        role: safeUserData.role ?? DEV_USER.role
      };
    }
    if (devBypass) return DEV_USER;
    return null;
  }, [devBypass, safeUserData, user]);

  const resolvedRole =
    safeUserData?.role ?? resolvedUser?.role ?? (devBypass ? "admin" : null);

  const resolvedRoles = useMemo(() => {
    if (devBypass) {
      const base = new Set<string>(["admin"]);
      roles.forEach((r) => r && base.add(r));
      if (resolvedRole) base.add(resolvedRole);
      return Array.from(base);
    }
    return roles;
  }, [devBypass, resolvedRole, roles]);

  const hasAccess = useCallback(
    (key: string, action = "lecture") => {
      const normalized = normalizeAccessKey(key);
      if (devBypass) {
        return true;
      }
      return can(
        resolvedAccessRights || {},
        normalized,
        action,
        resolvedRole ?? null
      );
    },
    [devBypass, resolvedAccessRights, resolvedRole]
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
      devFakeAuth: devBypass,
      loading: devBypass ? false : loading,
      signIn,
      signOut,
      hasAccess
    }),
    [
      devBypass,
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
