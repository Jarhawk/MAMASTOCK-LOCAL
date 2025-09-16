// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { deduceEnabledModulesFromRights } from '@/lib/access';
import { readConfig, writeConfig } from '@/appFs';import { isTauri } from "@/lib/tauriEnv";

function safeQueryClient() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQueryClient();
  } catch {
    return {
      invalidateQueries: () => {},
      setQueryData: () => {},
      fetchQuery: async () => {}
    };
  }
}

const defaults = {
  logo_url: null,
  primary_color: "#0ea5e9",
  secondary_color: "#f59e0b",
  email_envoi: "",
  email_alertes: "",
  dark_mode: false,
  langue: "fr",
  monnaie: "EUR",
  timezone: "Europe/Paris",
  rgpd_text: "",
  mentions_legales: ""
};

const localEnabledModules = {};
const localFeatureFlags = {};

export default function useMamaSettings() {
  const { user, mama_id: mamaId } = useAuth();
  const queryClient = safeQueryClient();

  const query = useQuery({
    queryKey: ['mama-settings', mamaId],
    enabled: !!mamaId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const cfg = (await readConfig()) || {};
      const settings = cfg.mamaSettings || {};
      return { ...defaults, ...settings };
    }
  });

  const updateMamaSettings = useCallback(
    async (fields) => {
      if (!mamaId) return { error: 'missing mama_id' };
      const cfg = (await readConfig()) || {};
      const current = cfg.mamaSettings || {};
      const next = { ...current, ...fields };
      cfg.mamaSettings = next;
      await writeConfig(cfg);
      queryClient.setQueryData(['mama-settings', mamaId], (old) => ({
        ...(old || {}),
        ...next
      }));
      return { data: next, error: null };
    },
    [mamaId, queryClient]
  );

  const settings = useMemo(() => query.data ?? defaults, [query.data]);

  const fallbackModules = useMemo(
    () => deduceEnabledModulesFromRights(user?.access_rights),
    [user?.access_rights]
  );

  const enabledModules = useMemo(() => {
    const em = settings?.enabled_modules;
    if (em && Object.keys(em).length > 0) return em;
    if (Object.keys(fallbackModules).length > 0) return fallbackModules;
    return localEnabledModules;
  }, [settings?.enabled_modules, fallbackModules]);
  const featureFlags = useMemo(
    () => settings?.feature_flags ?? localFeatureFlags,
    [settings?.feature_flags]
  );

  return {
    settings,
    loading: query.isFetching,
    enabledModules,
    featureFlags,
    ok: !query.error,
    fetchMamaSettings: query.refetch,
    updateMamaSettings
  };
}