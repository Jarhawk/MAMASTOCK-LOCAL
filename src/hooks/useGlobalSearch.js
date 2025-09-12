// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { query } from '@/local/db';


export function useGlobalSearch() {
  const { mama_id } = useAuth();
  const [results, setResults] = useState([]);

  async function search(q) {
    if (!q || !mama_id) {
      setResults([]);
      return [];
    }

    const like = `%${q}%`;
    const prodReq = query(
      'SELECT id, nom FROM produits WHERE mama_id = ? AND nom LIKE ? ORDER BY nom LIMIT 5',
      [mama_id, like]
    );
    const ficheReq = query(
      'SELECT id, nom FROM fiches_techniques WHERE mama_id = ? AND nom LIKE ? ORDER BY nom LIMIT 5',
      [mama_id, like]
    );
    const [produits, fiches] = await Promise.all([prodReq, ficheReq]);

    const merged = [
      ...(produits || []).map((p) => ({ type: 'produit', id: p.id, nom: p.nom })),
      ...(fiches || []).map((f) => ({ type: 'fiche', id: f.id, nom: f.nom }))
    ].slice(0, 2);

    setResults(merged);
    return merged;
  }

  return { results, search };
}