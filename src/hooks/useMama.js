// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { readConfig, writeConfig } from "@/appFs";
import { useAuth } from "@/hooks/useAuth";

export function useMama() {
  const { mama_id } = useAuth();
  const [mama, setMama] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchMama() {
    if (!mama_id) return null;
    setLoading(true);
    setError(null);
    try {
      const cfg = (await readConfig()) || {};
      const list = Array.isArray(cfg.mamas) ? cfg.mamas : [];
      const found = list.find((m) => m.id === mama_id) || null;
      setMama(found);
      return found;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function updateMama(fields) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      const cfg = (await readConfig()) || {};
      const list = Array.isArray(cfg.mamas) ? cfg.mamas : [];
      const idx = list.findIndex((m) => m.id === mama_id);
      if (idx === -1) throw new Error("Mama introuvable");
      list[idx] = { ...list[idx], ...fields };
      cfg.mamas = list;
      await writeConfig(cfg);
      setMama(list[idx]);
    } catch (err) {
      setError(err);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { mama, loading, error, fetchMama, updateMama };
}
