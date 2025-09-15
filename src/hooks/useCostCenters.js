// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { useAuditLog } from "@/hooks/useAuditLog";
import { readCostCenters, writeCostCenters } from "@/local/costCenters";import { isTauri } from "@/lib/runtime/isTauri";

export async function importCostCentersFromExcel(file, sheetName) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const pick = sheetName && wb.Sheets[sheetName] ? sheetName : wb.SheetNames[0];
  const ws = wb.Sheets[pick];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws);
}

export function useCostCenters() {
  const { log } = useAuditLog();
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCostCenters({ search = "" } = {}) {
    setLoading(true);
    setError(null);
    try {
      let data = await readCostCenters();
      if (search) {
        const s = search.toLowerCase();
        data = data.filter((c) => c.nom.toLowerCase().includes(s));
      }
      setCostCenters(data);
      return data;
    } catch (err) {
      setError(err?.message || String(err));
      setCostCenters([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function addCostCenter(values) {
    setLoading(true);
    setError(null);
    try {
      const list = await readCostCenters();
      const cc = {
        id: crypto.randomUUID(),
        nom: values.nom,
        actif: values.actif !== false
      };
      list.push(cc);
      await writeCostCenters(list);
      await fetchCostCenters();
      await log("Ajout cost center", cc);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function updateCostCenter(id, values) {
    setLoading(true);
    setError(null);
    try {
      const list = await readCostCenters();
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...values };
        await writeCostCenters(list);
        await log("Modification cost center", { id, ...values });
      }
      await fetchCostCenters();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteCostCenter(id) {
    setLoading(true);
    setError(null);
    try {
      const list = await readCostCenters();
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) {
        list[idx].actif = false;
        await writeCostCenters(list);
        await log("Suppression cost center", { id });
      }
      await fetchCostCenters();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function exportCostCentersToExcel() {
    const datas = (costCenters || []).map((c) => ({
      nom: c.nom,
      actif: c.actif
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datas), "CostCenters");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "centres_de_cout.xlsx");
  }

  async function importCostCentersFromExcelWithState(file, sheetName = "CostCenters") {
    setLoading(true);
    setError(null);
    try {
      const rows = await importCostCentersFromExcel(file, sheetName);
      for (const row of rows) {
        await addCostCenter({ nom: row.nom, actif: row.actif !== false });
      }
      await fetchCostCenters();
      return rows;
    } catch (err) {
      setError(err?.message || String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    costCenters,
    loading,
    error,
    fetchCostCenters,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    exportCostCentersToExcel,
    importCostCentersFromExcel: importCostCentersFromExcelWithState
  };
}