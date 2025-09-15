// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  achats_list,
  achat_get,
  achat_insert,
  achat_update } from
"@/local/achats";import { isTauri } from "@/lib/runtime/isTauri";

export function useAchats() {
  const { mama_id } = useAuth();
  const [achats, setAchats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getAchats({ fournisseur = "", produit = "", debut = "", fin = "", actif = true, page = 1, pageSize = 50 } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const { data, count } = await achats_list({
        mama_id,
        fournisseur,
        produit,
        debut,
        fin,
        actif,
        offset: (page - 1) * pageSize,
        limit: pageSize
      });
      setAchats(Array.isArray(data) ? data : []);
      setTotal(typeof count === "number" ? count : 0);
      return data || [];
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchAchatById(id) {
    if (!id || !mama_id) return null;
    try {
      return await achat_get(mama_id, id);
    } catch (e) {
      setError(e);
      return null;
    }
  }

  async function createAchat(achat) {
    if (!mama_id) return { error: "no mama_id" };
    try {
      const id = await achat_insert({ ...achat, mama_id });
      const full = await achat_get(mama_id, id);
      setAchats((a) => [full, ...a]);
      return { data: full };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  async function updateAchat(id, fields) {
    if (!mama_id) return { error: "no mama_id" };
    try {
      await achat_update(id, fields);
      const full = await achat_get(mama_id, id);
      setAchats((a) => a.map((ac) => ac.id === id ? full : ac));
      return { data: full };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  async function deleteAchat(id) {
    if (!mama_id) return { error: "no mama_id" };
    try {
      await achat_update(id, { actif: false });
      setAchats((a) => a.map((ac) => ac.id === id ? { ...ac, actif: false } : ac));
      return { success: true };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  return { achats, total, loading, error, getAchats, fetchAchatById, createAchat, updateAchat, deleteAchat };
}

export default useAchats;