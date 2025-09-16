// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useEffect, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import { stock_requisitionne_list } from '@/local/stockRequisitionne';import { isTauri } from "@/lib/tauriEnv";

export function useStockRequisitionne() {
  const { mama_id } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    const data = await stock_requisitionne_list(mama_id);
    setLoading(false);
    setStock(data);
    return data;
  }, [mama_id]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return { stock, fetchStock, loading };
}

export default useStockRequisitionne;