// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';

import { produits_list } from '@/lib/db';import { isTauri } from "@/lib/runtime/isTauri";

export function useProduitsInventaire() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduits = useCallback(
    async ({ search = '' } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await produits_list(search, false, 1, 1000);
        setProduits(Array.isArray(data) ? data : []);
        return data || [];
      } catch (err) {
        setError(err);
        setProduits([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { produits, loading, error, fetchProduits };
}

export default useProduitsInventaire;