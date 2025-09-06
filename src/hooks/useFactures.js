// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { facture_create_with_lignes } from "@/lib/db";

export function useFactures() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createFacture(facture, lignes) {
    setLoading(true);
    try {
      await facture_create_with_lignes(facture, lignes);
      setError(null);
      setLoading(false);
      return { error: null };
    } catch (e) {
      setError(e);
      setLoading(false);
      return { error: e };
    }
  }

  return {
    createFacture,
    loading,
    error,
  };
}

export default useFactures;
