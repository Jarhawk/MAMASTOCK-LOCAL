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
import { devFlags } from "@/lib/devFlags";
import {
  clearAuthSessionStorage,
  readStoredFirstRun,
  readStoredRedirectTo,
  readStoredSessionFlags,
  readStoredToken,
  readStoredUser,
  SessionFlags,
  writeStoredFirstRun,
  writeStoredRedirectTo,
  writeStoredSessionFlags,
  writeStoredToken,
  writeStoredUser,
  normalizeRedirectTarget
} from "@/lib/auth/sessionState";
import { can } from "@/utils/permissions";

export type User = {
  id: string | null;
  email: string | null;
  mama_id: string | null;
  role?: string | null;
} | null;

type AccessRights = Record<string, any> | null;

export type AuthSession = {
  user: NonNullable<User>;
  token: string | null;
  flags: SessionFlags;
  redirectTo: string | null;
  firstRun: boolean | null;
};

type SignInOptions = {
  token?: string | null;
  flags?: SessionFlags | null;
  redirectTo?: string | null;
  firstRun?: boolean | null;
};

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
  token: string | null;
  setToken: (value: string | null) => void;
  sessionFlags: SessionFlags;
  setSessionFlags: (value: SessionFlags | ((prev: SessionFlags) => SessionFlags)) => void;
  redirectTo: string | null;
  setRedirectTo: (value: string | null) => void;
  firstRun: boolean | null;
  setFirstRun: (value: boolean | null) => void;
  session: AuthSession | null;
  signIn: (u: NonNullable<User>, options?: SignInOptions) => Promise<void> | void;
  signOut: () => void;
  logout: () => void;
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
  token: null,
  setToken: () => {},
  sessionFlags: {},
  setSessionFlags: () => {},
  redirectTo: null,
  setRedirectTo: () => {},
  firstRun: null,
  setFirstRun: () => {},
  session: null,
  signIn: () => {},
  signOut: () => {},
  logout: () => {},
  hasAccess: () => devFlags.isDev
};

const AuthContext = createContext<Ctx>(defaultCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [userData, setUserData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(!devFlags.isDev);
  const [token, setTokenState] = useState<string | null>(() => readStoredToken());
  const [sessionFlags, setSessionFlagsState] = useState<SessionFlags>(() => readStoredSessionFlags());
  const [redirectTo, setRedirectToState] = useState<string | null>(() => readStoredRedirectTo());
  const [firstRun, setFirstRunState] = useState<boolean | null>(() => readStoredFirstRun());

  const devBypass = devFlags.isDev;

  const applyToken = useCallback((value: string | null | undefined) => {
    setTokenState(value && value.trim() ? value : null);
  }, []);

  const applySessionFlags = useCallback((value: SessionFlags | null | undefined) => {
    if (typeof value === "function") {
      // Should not happen but keeps type safety.
      setSessionFlagsState((prev) => value(prev));
      return;
    }
    const normalized: SessionFlags = {};
    if (value && typeof value === "object") {
      for (const [key, flag] of Object.entries(value)) {
        if (!key) continue;
        normalized[key] = !!flag;
      }
    }
    setSessionFlagsState(normalized);
  }, []);

  const applyRedirectTo = useCallback((value: string | null | undefined) => {
    const normalized = normalizeRedirectTarget(value ?? null);
    setRedirectToState(normalized);
  }, []);

  const applyFirstRun = useCallback((value: boolean | null | undefined) => {
    if (value === undefined || value === null) {
      setFirstRunState(null);
    } else {
      setFirstRunState(value ? true : false);
    }
  }, []);

  const updateSessionFlags = useCallback(
    (value: SessionFlags | ((prev: SessionFlags) => SessionFlags)) => {
      if (typeof value === "function") {
        setSessionFlagsState((prev) => {
          const next = value(prev);
          const normalized: SessionFlags = {};
          if (next && typeof next === "object") {
            for (const [key, flag] of Object.entries(next)) {
              if (!key) continue;
              normalized[key] = !!flag;
            }
          }
          return normalized;
        });
        return;
      }
      applySessionFlags(value);
    },
    [applySessionFlags]
  );

  const loadUser = useCallback(async (u: NonNullable<User>, options?: SignInOptions) => {
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
    writeStoredUser(persistedUser);
    if (options) {
      if (Object.prototype.hasOwnProperty.call(options, "token")) {
        applyToken(options.token ?? null);
      }
      if (Object.prototype.hasOwnProperty.call(options, "flags")) {
        applySessionFlags(options.flags ?? null);
      }
      if (Object.prototype.hasOwnProperty.call(options, "redirectTo")) {
        applyRedirectTo(options.redirectTo ?? null);
      }
      if (Object.prototype.hasOwnProperty.call(options, "firstRun")) {
        applyFirstRun(options.firstRun ?? null);
      }
    }
  }, [applyFirstRun, applyRedirectTo, applySessionFlags, applyToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const stored = readStoredUser();
        if (stored) await loadUser(stored);
      } catch {}
      setLoading(false);
    })();
  }, [loadUser]);

  useEffect(() => {
    writeStoredToken(token);
  }, [token]);

  useEffect(() => {
    writeStoredSessionFlags(sessionFlags);
  }, [sessionFlags]);

  useEffect(() => {
    writeStoredRedirectTo(redirectTo);
  }, [redirectTo]);

  useEffect(() => {
    writeStoredFirstRun(firstRun);
  }, [firstRun]);

  const signIn = useCallback(
    async (u: NonNullable<User>, options?: SignInOptions) => {
      await loadUser(u, options);
      setLoading(false);
    },
    [loadUser]
  );

  const signOut = useCallback(() => {
    setUser(null);
    setUserData(null);
    setRoles([]);
    clearAuthSessionStorage();
    setTokenState(null);
    setSessionFlagsState({});
    setRedirectToState(null);
    setFirstRunState(null);
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
      token,
      setToken: applyToken,
      sessionFlags,
      setSessionFlags: updateSessionFlags,
      redirectTo,
      setRedirectTo: applyRedirectTo,
      firstRun,
      setFirstRun: applyFirstRun,
      session: resolvedUser
        ? {
            user: resolvedUser as NonNullable<User>,
            token,
            flags: sessionFlags,
            redirectTo,
            firstRun
          }
        : null,
      signIn,
      signOut,
      logout: signOut,
      hasAccess
    }),
    [
      applyFirstRun,
      applyRedirectTo,
      applyToken,
      devBypass,
      hasAccess,
      loading,
      resolvedAccessRights,
      resolvedRole,
      resolvedRoles,
      resolvedUser,
      sessionFlags,
      redirectTo,
      firstRun,
      token,
      updateSessionFlags,
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
