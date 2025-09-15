// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";
import { readConfig, writeConfig } from "@/appFs";
import { DEFAULT_ROLES } from "@/constants/roles";import { isTauri } from "@/lib/db/sql";

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ensureDefaults(cfg) {
    if (!cfg.roles || !Array.isArray(cfg.roles) || cfg.roles.length === 0) {
      cfg.roles = DEFAULT_ROLES;
      await writeConfig(cfg);
    }
  }

  const fetchRoles = async () => {
    setLoading(true);
    const cfg = (await readConfig()) || {};
    await ensureDefaults(cfg);
    setRoles(cfg.roles || []);
    setLoading(false);
  };

  const addOrUpdateRole = async (role) => {
    const cfg = (await readConfig()) || {};
    await ensureDefaults(cfg);
    const list = cfg.roles || [];
    const idx = list.findIndex((r) => r.id === role.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...role };else
    list.push({ ...role, id: role.id || crypto.randomUUID(), actif: true });
    cfg.roles = list;
    await writeConfig(cfg);
    await fetchRoles();
    return { data: role };
  };

  const toggleActif = async (id, actif) => {
    const cfg = (await readConfig()) || {};
    await ensureDefaults(cfg);
    const r = (cfg.roles || []).find((x) => x.id === id);
    if (r) r.actif = actif;
    await writeConfig(cfg);
    await fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, fetchRoles, addOrUpdateRole, toggleActif };
}

export default useRoles;