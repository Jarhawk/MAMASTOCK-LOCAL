// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { fiches_actives_list, fiches_create, fiches_update, fiches_delete } from '@/lib/db';import { isTauri } from "@/lib/db/sql";

export function useFichesTechniques() {
  const { mama_id } = useAuth();
  const [fichesTechniques, setFichesTechniques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchFichesTechniques() {
    setLoading(true);
    setError(null);
    try {
      const data = await fiches_actives_list(mama_id);
      setFichesTechniques(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchFichesTechniques error:', err);
      setError(err.message || "Erreur chargement fiches techniques.");
      setFichesTechniques([]);
    } finally {
      setLoading(false);
    }
  }

  async function addFicheTechnique(ft) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      const id = await fiches_create({ ...ft, mama_id }, []);
      const fiche = { ...ft, id };
      setFichesTechniques((prev) => [...prev, fiche]);
      return { data: id };
    } catch (err) {
      console.error('addFicheTechnique error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function updateFicheTechnique(id, updateFields) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await fiches_update(id, mama_id, updateFields, []);
      setFichesTechniques((prev) => prev.map((f) => f.id === id ? { ...f, ...updateFields } : f));
      return { data: id };
    } catch (err) {
      console.error('updateFicheTechnique error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function deleteFicheTechnique(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await fiches_delete(id, mama_id);
      setFichesTechniques((prev) => prev.filter((f) => f.id !== id));
      return { data: id };
    } catch (err) {
      console.error('deleteFicheTechnique error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  return {
    fichesTechniques,
    loading,
    error,
    fetchFichesTechniques,
    addFicheTechnique,
    updateFicheTechnique,
    deleteFicheTechnique
  };
}