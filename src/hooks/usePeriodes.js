// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  periodes_list,
  periodes_create,
  periodes_get,
  periodes_active,
  periodes_close,
} from "@/lib/db";

export default function usePeriodes() {
  const { mama_id } = useAuth();
  const [periodes, setPeriodes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPeriodes() {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await periodes_list(mama_id);
      setPeriodes(Array.isArray(data) ? data : []);
      setCurrent(data.find((p) => p.actif) || null);
      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function createPeriode({ debut, fin }) {
    if (!mama_id) return { error: 'no mama_id' };
    setLoading(true);
    setError(null);
    try {
      const data = await periodes_create({ mama_id, debut, fin });
      await fetchPeriodes();
      return { data };
    } catch (error) {
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }

  async function cloturerPeriode(id) {
    if (!mama_id) return { error: 'no mama_id' };
    setLoading(true);
    setError(null);
    const periode = await periodes_get(id, mama_id);
    if (!periode) {
      setLoading(false);
      const err = new Error('Période introuvable');
      setError(err);
      return { error: err };
    }
    await periodes_close(id, mama_id);
    const debut = new Date(periode.fin);
    debut.setDate(debut.getDate() + 1);
    const fin = new Date(debut);
    fin.setMonth(fin.getMonth() + 1);
    fin.setDate(fin.getDate() - 1);
    await periodes_create({
      mama_id,
      debut: debut.toISOString().slice(0, 10),
      fin: fin.toISOString().slice(0, 10),
    });
    setLoading(false);
    await fetchPeriodes();
    return { data: true };
  }

  async function checkCurrentPeriode(date) {
    if (!mama_id) return { error: 'no mama_id' };
    try {
      const data = await periodes_active(mama_id);
      if (!data) return { error: new Error('Aucune période active') };
      if (data.cloturee || date < data.debut || date > data.fin)
        return { error: new Error('Période comptable clôturée') };
      return { data };
    } catch (error) {
      return { error };
    }
  }

  return {
    periodes,
    current,
    loading,
    error,
    fetchPeriodes,
    createPeriode,
    cloturerPeriode,
    checkCurrentPeriode
  };
}