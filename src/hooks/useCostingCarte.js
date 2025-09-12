// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { costing_carte_list, settings_get } from '@/lib/db';
import { useState, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import JSPDF from 'jspdf';
import 'jspdf-autotable';

export function useCostingCarte() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCosting = useCallback(
    async (filters = {}) => {
      if (!mama_id) return [];
      setLoading(true);
      setError(null);
      try {
        const rows = await costing_carte_list({
          mama_id,
          type: filters.type,
          famille: filters.famille,
          actif: filters.actif,
        });
        setData(rows || []);
        return rows || [];
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

  const fetchSettings = useCallback(
    async () => {
      if (!mama_id) return null;
      const row = await settings_get(mama_id);
      setSettings(row);
      return row;
    },
    [mama_id]
  );

  const exportExcel = useCallback((rows) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Costing');
    XLSX.writeFile(wb, 'costing_carte.xlsx');
  }, []);

  const exportPdf = useCallback((rows) => {
    const doc = new JSPDF();
    const headers = [
    ['Nom fiche', 'Type', 'Coût/portion', 'Prix vente', 'Marge €', 'Marge %', 'Food cost %']];

    const body = rows.map((r) => [
    r.nom,
    r.type,
    r.cout_par_portion ?? '',
    r.prix_vente ?? '',
    r.marge_euro ?? '',
    r.marge_pct ?? '',
    r.food_cost_pct ?? '']
    );
    doc.autoTable({ head: headers, body });
    doc.save('costing_carte.pdf');
  }, []);

  return {
    data,
    settings,
    loading,
    error,
    fetchCosting,
    fetchSettings,
    exportExcel,
    exportPdf
  };
}