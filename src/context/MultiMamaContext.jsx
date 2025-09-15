// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { readConfig } from '@/appFs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';import { isTauri } from "@/lib/runtime/isTauri";

const MultiMamaContext = createContext();

export function MultiMamaProvider({ children }) {
  const { isSuperadmin, mama_id: authMamaId } = useAuth();
  const [mamas, setMamas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mamaActif, setMamaActifState] = useState(
    localStorage.getItem('mamaActif') || authMamaId
  );

  useEffect(() => {
    if (authMamaId && !mamaActif) {
      setMamaActifState(authMamaId);
    }
  }, [authMamaId]);

  useEffect(() => {
    if (authMamaId || isSuperadmin) fetchMamas();
  }, [authMamaId, isSuperadmin]);

  async function fetchMamas() {
    setLoading(true);
    try {
      const cfg = (await readConfig()) || {};
      let data = Array.isArray(cfg.mamas) ? cfg.mamas : [];
      if (!isSuperadmin && authMamaId) {
        data = data.filter((m) => m.id === authMamaId);
      }
      setMamas(data);
      if (!mamaActif && data.length > 0) {
        changeMama(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  const changeMama = (id) => {
    setMamaActifState(id);
    localStorage.setItem('mamaActif', id);
  };

  const value = { mamas, mamaActif, setMamaActif: changeMama, loading };

  if (loading && mamas.length === 0) {
    return <LoadingSpinner message="Chargement établissements..." />;
  }

  return (
    <MultiMamaContext.Provider value={value}>
      {children}
    </MultiMamaContext.Provider>);

}

export function useMultiMama() {
  return useContext(MultiMamaContext) || {};
}