// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  inventaires_list,
  inventaire_get,
  inventaire_create,
  inventaire_update,
  inventaire_delete,
  inventaire_reactivate,
  inventaire_cloture,
  inventaire_last_closed,
} from '@/lib/db';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export function useInventaires() {
  const { mama_id } = useAuth();
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mama_id) void getInventaires();
  }, [mama_id]);

  async function getInventaires({
    zoneId,
    periodeId,
    statut,
    includeArchives = false,
  } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      let rows = await inventaires_list(mama_id);
      if (zoneId) rows = rows.filter((r) => r.zone_id === zoneId);
      if (periodeId) rows = rows.filter((r) => r.periode_id === periodeId);
      if (statut) rows = rows.filter((r) => r.statut === statut);
      if (!includeArchives) rows = rows.filter((r) => r.actif !== 0);
      setInventaires(rows);
      return rows;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function addInventaire(inv = {}) {
    if (!mama_id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await inventaire_create({ ...inv, mama_id });
      await getInventaires();
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function editInventaire(id, fields) {
    if (!mama_id || !id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await inventaire_update(id, mama_id, fields);
      await getInventaires();
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function getInventaireById(id) {
    if (!mama_id || !id) return null;
    try {
      return await inventaire_get(id, mama_id);
    } catch (err) {
      setError(err);
      return null;
    }
  }

  async function deleteInventaire(id) {
    if (!mama_id || !id) return;
    setLoading(true);
    setError(null);
    try {
      await inventaire_delete(id, mama_id);
      await getInventaires();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function reactivateInventaire(id) {
    if (!mama_id || !id) return;
    await inventaire_reactivate(id, mama_id);
    await getInventaires();
  }

  async function clotureInventaire(id) {
    if (!mama_id || !id) return;
    setLoading(true);
    setError(null);
    try {
      await inventaire_cloture(id, mama_id);
      await getInventaires();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLastClosedInventaire(beforeDate) {
    if (!mama_id) return null;
    try {
      return await inventaire_last_closed(mama_id, beforeDate);
    } catch (err) {
      setError(err);
      return null;
    }
  }

    async function validateInventaireStock(inventaireId) {
      if (!isTauri) {
        console.info('useInventaires: ignoré hors Tauri');
        return false;
      }
      if (!mama_id || !inventaireId) return false;
      const inv = await inventaire_get(inventaireId, mama_id);
      if (!inv) return false;
      const db = await getDb();
    for (const line of inv.lignes || []) {
      const rows = await db.select(
        'SELECT stock_theorique FROM produits WHERE id = ? AND mama_id = ?',
        [line.produit_id, mama_id]
      );
      const stock = rows[0]?.stock_theorique ?? null;
      if (stock === null || Number(stock) !== Number(line.quantite_reelle)) {
        return false;
      }
    }
    return true;
  }

  return {
    inventaires,
    loading,
    error,
    getInventaires,
    addInventaire,
    editInventaire,
    getInventaireById,
    deleteInventaire,
    reactivateInventaire,
    clotureInventaire,
    fetchLastClosedInventaire,
    validateInventaireStock,
  };
}

export default useInventaires;
