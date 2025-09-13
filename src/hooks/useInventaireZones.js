// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { zones_stock_list } from '@/lib/db';
import { getDb } from '@/lib/sql';
import { isTauri } from '@/lib/runtime';
import { toast } from 'sonner';

export function useInventaireZones() {
  const { mama_id } = useAuth();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    async function getZones() {
      if (!isTauri) {
        console.info('useInventaireZones: ignoré hors Tauri');
        return [];
      }
      if (!mama_id) return [];
      setLoading(true);
      setError(null);
      try {
      const data = await zones_stock_list(mama_id);
      setZones(Array.isArray(data) ? data : []);
      return data || [];
    } catch (err) {
      setError(err);
      toast.error(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }

    async function createZone(zone) {
      if (!isTauri) {
        console.info('useInventaireZones: ignoré hors Tauri');
        return;
      }
      if (!mama_id) return;
      setLoading(true);
      setError(null);
      try {
      const db = await getDb();
      await db.execute(
        'INSERT INTO inventaire_zones(nom,mama_id,actif) VALUES(?,?,1)',
        [zone.nom, mama_id]
      );
      await getZones();
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

    async function updateZone(id, fields) {
      if (!isTauri) {
        console.info('useInventaireZones: ignoré hors Tauri');
        return;
      }
      if (!mama_id || !id) return;
      setLoading(true);
      setError(null);
      try {
      const entries = Object.entries(fields);
      if (!entries.length) return;
      const sets = entries.map(([k]) => `${k} = ?`).join(', ');
      const params = entries.map(([, v]) => v);
      params.push(id, mama_id);
      const db = await getDb();
      await db.execute(
        `UPDATE inventaire_zones SET ${sets} WHERE id = ? AND mama_id = ?`,
        params
      );
      await getZones();
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

    async function deleteZone(id) {
      if (!isTauri) {
        console.info('useInventaireZones: ignoré hors Tauri');
        return;
      }
      if (!mama_id || !id) return;
      setLoading(true);
      setError(null);
      try {
      const db = await getDb();
      await db.execute(
        'UPDATE inventaire_zones SET actif = 0 WHERE id = ? AND mama_id = ?',
        [id, mama_id]
      );
      await getZones();
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

    async function reactivateZone(id) {
      if (!isTauri) {
        console.info('useInventaireZones: ignoré hors Tauri');
        return;
      }
      if (!mama_id || !id) return;
      const db = await getDb();
    await db.execute(
      'UPDATE inventaire_zones SET actif = 1 WHERE id = ? AND mama_id = ?',
      [id, mama_id]
    );
    await getZones();
  }

  return {
    zones,
    loading,
    error,
    getZones,
    createZone,
    updateZone,
    deleteZone,
    reactivateZone,
  };
}

export default useInventaireZones;
