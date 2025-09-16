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
import { shouldBypassAccessGuards } from "@/lib/runtime/devFlags";

export type User = {
  id: string;
  email: string;
  mama_id: string;
  role?: string;
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

const DEV_FAKE_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "dev@local",
  nom: "Dev Admin",
  mama_id: "dev-local",
  role: "admin",
  actif: true
} as const;

const DEV_FAKE_ACCESS_RIGHTS: Record<string, true> = {
  dashboard: true,
  produits: true,
  fournisseurs: true,
  factures: true,
  fiches: true,
  fiches_techniques: true,
  inventaire: true,
  inventaires: true,
  transferts: true,
  taches: true,
  parametrage: true,
  commandes: true,
  requisitions: true,
  menus: true,
  menu_du_jour: true,
  menu_engineering: true,
  documents: true,
  analyse: true,
  promotions: true,
  notifications: true,
  alertes: true,
  access: true,
  permissions: true,
  roles: true,
  utilisateurs: true,
  mamas: true,
  costing_carte: true,
  stock: true
} as const;

const DEV_FAKE_USER_DATA = {
  ...DEV_FAKE_USER,
  access_rights: DEV_FAKE_ACCESS_RIGHTS
};

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User>(null);
  const [userData, setUserData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const devBypass = shouldBypassAccessGuards();

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
    setRoles(aliases.filter(Boolean));
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

  const fallbackUserData = useMemo(() => {
    if (!devBypass) return null;
    const rights = userData?.access_rights;
    if (!userData || !rights || Object.keys(rights).length === 0) {
      return DEV_FAKE_USER_DATA;
    }
    return null;
  }, [devBypass, userData]);

  const resolvedUserData = fallbackUserData ?? userData;
  const resolvedUser: User = useMemo(() => {
    if (fallbackUserData) {
      return {
        id: DEV_FAKE_USER.id,
        email: DEV_FAKE_USER.email,
        mama_id: DEV_FAKE_USER.mama_id,
        role: "admin"
      };
    }
    if (user) return user;
    if (devBypass) {
      return {
        id: null,
        email: null,
        mama_id: DEV_FAKE_USER.mama_id,
        role: "admin"
      };
    }
    return null;
  }, [devBypass, fallbackUserData, user]);

  const resolvedRoles = useMemo(() => {
    if (devBypass) {
      const base = new Set<string>(["admin"]);
      roles.forEach((r) => base.add(r));
      if (resolvedUser?.role) base.add(resolvedUser.role);
      return Array.from(base);
    }
    return roles;
  }, [devBypass, resolvedUser?.role, roles]);

  const resolvedAccessRights: AccessRights = useMemo(() => {
    const rights = resolvedUserData?.access_rights;
    if (devBypass) {
      return { ...DEV_FAKE_ACCESS_RIGHTS, ...(rights || {}) };
    }
    return rights ?? null;
  }, [devBypass, resolvedUserData]);

  const resolvedRole = resolvedUserData?.role ?? resolvedUser?.role ?? (devBypass ? "admin" : null);

  const hasAccess = useCallback(
    (key: string, action = "lecture") => {
      const k = normalizeAccessKey(key);
      if (devBypass) {
        return true;
      }
      return can(resolvedAccessRights || {}, k, action, resolvedRole ?? null);
    },
    [devBypass, resolvedAccessRights, resolvedRole]
  );

  const value = useMemo<Ctx>(() => ({
    id: resolvedUser?.id ?? null,
    email: resolvedUser?.email ?? null,
    mama_id: resolvedUser?.mama_id ?? null,
    role: resolvedRole ?? null,
    roles: resolvedRoles,
    user: resolvedUser,
    userData: resolvedUserData,
    access_rights: resolvedAccessRights,
    devFakeAuth: devBypass,
    loading,
    signIn,
    signOut,
    hasAccess
  }), [
    resolvedUser,
    resolvedRole,
    resolvedRoles,
    resolvedUserData,
    resolvedAccessRights,
    devBypass,
    loading,
    signIn,
    signOut,
    hasAccess
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}