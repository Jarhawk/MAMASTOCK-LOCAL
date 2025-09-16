// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { readConfig, writeConfig } from '@/appFs';
import { toast } from 'sonner';import { isTauri } from "@/lib/tauriEnv";

export function useFournisseurApiConfig() {
  const { mama_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchConfig(fournisseur_id) {
    if (!mama_id || !fournisseur_id) return null;
    setLoading(true);
    const cfg = (await readConfig()) || {};
    const list = cfg.fournisseurs_api_config || [];
    const data = list.find(
      (c) => c.mama_id === mama_id && c.fournisseur_id === fournisseur_id
    ) || null;
    setLoading(false);
    return data;
  }

  async function saveConfig(fournisseur_id, config) {
    if (!mama_id || !fournisseur_id) return { error: 'missing context' };
    setLoading(true);
    const cfg = (await readConfig()) || {};
    const list = cfg.fournisseurs_api_config || [];
    const entry = { ...config, fournisseur_id, mama_id };
    const idx = list.findIndex(
      (c) => c.mama_id === mama_id && c.fournisseur_id === fournisseur_id
    );
    if (idx >= 0) list[idx] = entry;else list.push(entry);
    cfg.fournisseurs_api_config = list;
    await writeConfig(cfg);
    setLoading(false);
    toast.success('Configuration enregistrée');
    return { data: entry, error: null };
  }

  async function deleteConfig(fournisseur_id) {
    if (!mama_id || !fournisseur_id) return { error: 'missing context' };
    setLoading(true);
    const cfg = (await readConfig()) || {};
    const list = (cfg.fournisseurs_api_config || []).filter(
      (c) => !(c.mama_id === mama_id && c.fournisseur_id === fournisseur_id)
    );
    cfg.fournisseurs_api_config = list;
    await writeConfig(cfg);
    setLoading(false);
    toast.success('Configuration supprimée');
    return { error: null };
  }

  async function listConfigs({ fournisseur_id, actif, page = 1, limit = 20 } = {}) {
    if (!mama_id) return { data: [], count: 0, error: null };
    setLoading(true);
    const cfg = (await readConfig()) || {};
    let list = (cfg.fournisseurs_api_config || []).filter(
      (c) => c.mama_id === mama_id
    );
    if (fournisseur_id) list = list.filter((c) => c.fournisseur_id === fournisseur_id);
    if (actif !== undefined && actif !== null)
    list = list.filter((c) => c.actif === actif);
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const start = (p - 1) * l;
    const data = list.slice(start, start + l);
    setLoading(false);
    return { data, count: list.length, error: null };
  }

  return { loading, error, fetchConfig, saveConfig, deleteConfig, listConfigs };
}