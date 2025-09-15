// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { readConfig, writeConfig } from '@/appFs';import { isTauri } from "@/lib/runtime/isTauri";

const HelpContext = createContext();

export function HelpProvider({ children }) {
  const auth = useAuth();
  const mama_id = auth?.mama_id;
  const user_id = auth?.user_id ?? auth?.user?.id;
  const authLoading = auth?.loading;
  const isAuthenticated = auth?.isAuthenticated;

  const [tooltips, setTooltips] = useState({});
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTooltips = useCallback(async () => {
    if (authLoading || !isAuthenticated || !mama_id) return {};
    setLoading(true);
    try {
      const cfg = (await readConfig()) || {};
      const list = Array.isArray(cfg.tooltips) ? cfg.tooltips : [];
      const map = {};
      list.forEach((t) => {
        if (t.champ) map[t.champ] = t.texte;
      });
      setTooltips(map);
      return map;
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, mama_id]);

  const fetchDocs = useCallback(async ({ search = '' } = {}) => {
    if (authLoading || !isAuthenticated || !mama_id) return [];
    setLoading(true);
    try {
      const cfg = (await readConfig()) || {};
      let list = Array.isArray(cfg.documentation) ? cfg.documentation : [];
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((d) => d.titre?.toLowerCase().includes(s));
      }
      setDocs(list);
      return list;
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, mama_id]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && mama_id) {
      fetchTooltips();
      fetchDocs();
    }
  }, [authLoading, isAuthenticated, mama_id, fetchTooltips, fetchDocs]);

  async function markGuideSeen(module) {
    if (authLoading || !isAuthenticated || !user_id || !mama_id) return;
    const cfg = (await readConfig()) || {};
    const seen = cfg.guidesSeen || {};
    if (!seen[mama_id]) seen[mama_id] = {};
    if (!seen[mama_id][user_id]) seen[mama_id][user_id] = {};
    seen[mama_id][user_id][module] = true;
    cfg.guidesSeen = seen;
    await writeConfig(cfg);
  }

  const value = {
    tooltips,
    docs,
    loading,
    fetchTooltips,
    fetchDocs,
    markGuideSeen
  };

  if (authLoading) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !mama_id) {
    return <>{children}</>;
  }

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  return useContext(HelpContext) || {};
}