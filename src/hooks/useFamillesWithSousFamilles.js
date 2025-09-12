// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  familles_list,
  familles_insert,
  familles_update,
  familles_delete,
  sous_familles_list,
  sous_familles_insert,
  sous_familles_update,
  sous_familles_delete,
} from '@/lib/db';

export function useFamillesWithSousFamilles() {
  const { mama_id } = useAuth();
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const [famRes, sousRes] = await Promise.all([
        familles_list(mama_id),
        sous_familles_list(mama_id),
      ]);
      const grouped = famRes.map((f) => ({
        ...f,
        sous_familles: sousRes.filter((sf) => sf.famille_id === f.id),
      }));
      setFamilles(grouped);
    } catch (e) {
      setError(e);
      setFamilles([]);
    }
    setLoading(false);
  }, [mama_id]);

  async function addFamille(values) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await familles_insert({ ...values, mama_id });
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function updateFamille(id, values) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await familles_update(id, mama_id, values);
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function deleteFamille(id) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await familles_delete(id, mama_id);
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function addSousFamille(famille_id, values) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await sous_familles_insert({ ...values, famille_id, mama_id });
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function updateSousFamille(id, values) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await sous_familles_update(id, mama_id, values);
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function deleteSousFamille(id) {
    if (!mama_id) return { error: 'Aucun mama_id' };
    try {
      await sous_familles_delete(id, mama_id);
      await fetchAll();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function toggleFamille(famille) {
    return updateFamille(famille.id, { nom: famille.nom, actif: !famille.actif });
  }

  async function toggleSousFamille(sf) {
    return updateSousFamille(sf.id, { nom: sf.nom, actif: !sf.actif });
  }

  return {
    familles,
    loading,
    error,
    fetchAll,
    addFamille,
    updateFamille,
    deleteFamille,
    addSousFamille,
    updateSousFamille,
    deleteSousFamille,
    toggleFamille,
    toggleSousFamille
  };
}

export default useFamillesWithSousFamilles;