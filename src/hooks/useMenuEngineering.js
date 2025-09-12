// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { menu_engineering_list, menu_engineering_save_vente } from '@/lib/db';

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function classify(marge, medMarge, pop, medPop) {
  if (marge >= medMarge && pop >= medPop) return 'Star';
  if (marge >= medMarge && pop < medPop) return 'Puzzle';
  if (marge < medMarge && pop >= medPop) return 'Plowhorse';
  return 'Dog';
}

export function useMenuEngineering() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (arg1, arg2) => {
      if (!mama_id) return [];
      let periode, filters;
      if (typeof arg1 === 'string') {
        periode = arg1;
        filters = arg2 || {};
      } else {
        filters = arg1 || {};
        periode = filters.periode;
      }
      const mois = (periode || new Date().toISOString().slice(0, 7)).slice(0, 7);
      setLoading(true);
      setError(null);
      try {
        const rows = await menu_engineering_list({ mama_id, mois, famille: filters.famille, actif: filters.actif });
        const total = rows.reduce((acc, r) => acc + (r.ventes || 0), 0);
        const enriched = rows.map(r => {
          const margeEuro = (r.prix_vente || 0) - (r.cout_par_portion || 0);
          const marge = r.prix_vente ? (margeEuro / r.prix_vente) * 100 : 0;
          const ca = (r.ventes || 0) * (r.prix_vente || 0);
          const popularite = total ? (r.ventes || 0) / total : 0;
          return { ...r, margeEuro, marge, ca, popularite };
        });
        const medMarge = median(enriched.map(r => r.marge));
        const medPop = median(enriched.map(r => r.popularite));
        const classified = enriched.map(r => ({
          ...r,
          classement: classify(r.marge, medMarge, r.popularite, medPop),
        }));
        setData(classified);
        return classified;
      } catch (e) {
        setError(e);
        setData([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  const saveVente = useCallback(
    async (fiche_id, periode, quantite, prix_vente_unitaire = null) => {
      if (!mama_id) return;
      const mois = (periode || new Date().toISOString().slice(0, 7)).slice(0, 7) + '-01';
      await menu_engineering_save_vente({
        mama_id,
        fiche_id,
        date_vente: mois,
        quantite: Number(quantite) || 0,
        prix_vente_unitaire,
      });
    },
    [mama_id]
  );

  return { data, fetchData, saveVente, loading, error };
}

export default useMenuEngineering;
