// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';

import { fournisseurs_list } from '@/lib/db';

export default function useFournisseursBrowse({
  page = 1,
  limit = 20,
  term = '',
  filters = {}
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aborted = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { rows, total } = await fournisseurs_list(term, limit, page);
        if (!aborted) {
          setData(rows || []);
          setTotal(total);
        }
      } catch (err) {
        console.error(err);
        if (!aborted) {
          setError(err);
          setData([]);
          setTotal(0);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [page, limit, term, JSON.stringify(filters)]);

  return { data, total, loading, error };
}