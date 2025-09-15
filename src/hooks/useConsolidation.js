// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { consolidation_performance } from "@/lib/db";
import { readConfig } from "@/appFs";
import * as XLSX from "xlsx";
import JSPDF from "jspdf";
import "jspdf-autotable";import { isTauri } from "@/lib/db/sql";

export function useConsolidation() {
  const [sites, setSites] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = (await readConfig()) || {};
      const list = cfg.user_mama_access || [];
      setSites(list);
      setLoading(false);
      return list;
    } catch (e) {
      setError(e.message || e);
      setSites([]);
      setLoading(false);
      return [];
    }
  }, []);

  const fetchConsoMensuelle = useCallback(
    async ({ mamaIds = [], start, end } = {}) => {
      setLoading(true);
      try {
        const data = await consolidation_performance({ start, end });
        const filtered = mamaIds.length ?
        data.filter((r) => mamaIds.includes(r.mama_id)) :
        data;
        setRows(filtered);
        setLoading(false);
        return filtered;
      } catch (e) {
        setError(e.message || e);
        setRows([]);
        setLoading(false);
        return [];
      }
    },
    []
  );

  const exportExcel = useCallback((data) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Consolidation");
    XLSX.writeFile(wb, "consolidation.xlsx");
  }, []);

  const exportPdf = useCallback((data) => {
    const doc = new JSPDF();
    if (data && data.length > 0) {
      const head = [Object.keys(data[0])];
      const body = data.map((r) => Object.values(r));
      doc.autoTable({ head, body });
    }
    doc.save("consolidation.pdf");
  }, []);

  const getKpis = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { ca: 0, achats: 0, marge: 0, stock: 0 };
    }
    const ca = data.reduce((s, r) => s + (r.total_ventes || 0), 0);
    const achats = data.reduce((s, r) => s + (r.total_achats || 0), 0);
    const marge = data.reduce((s, r) => s + (r.marge || 0), 0);
    const stock = data.reduce((s, r) => s + (r.valeur_stock || 0), 0);
    return { ca, achats, marge, stock };
  }, []);

  return {
    sites,
    rows,
    loading,
    error,
    fetchSites,
    fetchConsoMensuelle,
    exportExcel,
    exportPdf,
    getKpis
  };
}

export default useConsolidation;