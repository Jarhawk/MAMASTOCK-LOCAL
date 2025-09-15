// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  promotions_list,
  promotions_add,
  promotions_update,
  promotions_delete } from
"@/local/promotions";import { isTauri } from "@/lib/db/sql";

export function usePromotions() {
  const { mama_id } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPromotions({ search = "", actif = null, page = 1, limit = 20 } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await promotions_list({
        mama_id,
        search,
        actif,
        page,
        limit
      });
      setPromotions(data);
      setTotal(total);
      return data;
    } catch (e) {
      setError(e.message || e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function addPromotion(values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await promotions_add({ ...values, mama_id });
      await fetchPromotions();
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function updatePromotion(id, values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await promotions_update(id, values);
      await fetchPromotions();
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function deletePromotion(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await promotions_delete(id);
      await fetchPromotions();
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  return {
    promotions,
    total,
    loading,
    error,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion
  };
}