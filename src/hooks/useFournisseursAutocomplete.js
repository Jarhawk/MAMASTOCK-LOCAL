import { useEffect, useState } from 'react';

import useDebounce from '@/hooks/useDebounce';
import { fournisseurs_list } from '@/lib/db';

/**
 * Autocomplete fournisseurs by nom
 * @param {{ term?: string, limit?: number }} params
 */import { isTauri } from "@/lib/db/sql";
export function useFournisseursAutocomplete({ term = '', limit = 20 } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const search = useDebounce(term, 250);

  useEffect(() => {
    let aborted = false;
    const s = search.trim();
    if (s === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { rows } = await fournisseurs_list(s, limit, 1);
        if (!aborted) setOptions(rows || []);
      } catch (err) {
        console.error(err);
        if (!aborted) {
          setError(err);
          setOptions([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [search, limit]);

  return { options, loading, error };
}

export async function searchFournisseurs(term = '', limit = 20, page = 1) {
  const { rows } = await fournisseurs_list(term, limit, page);
  return rows || [];
}