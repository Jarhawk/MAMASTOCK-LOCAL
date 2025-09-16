// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logs_list, logs_add, rapports_list } from "@/local/logs";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";import { isTauri } from "@/lib/tauriEnv";

export function useLogs() {
  const { mama_id } = useAuth();
  const [logs, setLogs] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchLogs(filters = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await logs_list(mama_id, filters);
      setLogs(data);
      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function logAction({ type, module, description, donnees = {}, critique = false }) {
    if (!mama_id) return { error: "no mama" };
    try {
      await logs_add({ mama_id, type, module, description, donnees, critique });
    } catch (err) {
      return { error: err };
    }
    return {};
  }

  async function fetchRapports() {
    if (!mama_id) return [];
    try {
      const data = await rapports_list(mama_id);
      setRapports(data);
      return data;
    } catch (err) {
      setError(err);
      return [];
    }
  }

  function downloadRapport(id) {
    const r = rapports.find((x) => x.id === id);
    if (r?.chemin_fichier) {
      window.open(r.chemin_fichier, "_blank");
    }
  }

  function exportLogs(format = "csv") {
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(logs);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Logs");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf]), "logs.xlsx");
    } else {
      const header = "Date;Type;Module;Description;Critique\n";
      const csv = logs.
      map((l) => `${l.date_log};${l.type};${l.module};${l.description};${l.critique}`).
      join("\n");
      const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "logs.csv");
    }
  }

  return {
    logs,
    rapports,
    loading,
    error,
    fetchLogs,
    logAction,
    fetchRapports,
    downloadRapport,
    exportLogs
  };
}

export default useLogs;