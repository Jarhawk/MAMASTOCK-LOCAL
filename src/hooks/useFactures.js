// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { facture_create, facture_add_ligne } from "@/lib/db";import { isTauri } from "@/lib/tauriEnv";

export function useFactures() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createFacture(facture, lignes) {
    if (!isTauri()) {
      console.info("useFactures: ignoré hors Tauri");
      const err = new Error("Disponible uniquement dans l’app Tauri");
      setError(err);
      return { error: err };
    }
    setLoading(true);
    try {
      const facture_id = await facture_create({
        fournisseur_id: facture.fournisseur_id,
        date_iso: facture.date
      });
      for (const l of lignes) {
        await facture_add_ligne({
          facture_id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: l.prix
        });
      }
      setError(null);
      setLoading(false);
      return { error: null };
    } catch (e) {
      setError(e);
      setLoading(false);
      return { error: e };
    }
  }

  async function deleteFacture() {
    // TODO: implémenter la suppression de facture via le DAL
    throw new Error('TODO deleteFacture');
  }

  async function toggleFactureActive() {
    // TODO: implémenter l'activation/désactivation de facture via le DAL
    throw new Error('TODO toggleFactureActive');
  }

  return {
    createFacture,
    deleteFacture,
    toggleFactureActive,
    loading,
    error
  };
}

export default useFactures;