// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useEffect } from "react";
import { reporting_financier } from "@/lib/db";
import { saveText } from "@/local/files";
import { useAuth } from "@/hooks/useAuth";import { isTauri } from "@/lib/tauriEnv";

export function useReportingFinancier({ start, end }) {
  const { mama_id } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mama_id || !start || !end) return;
    if (!isTauri()) {
      console.info("useReportingFinancier: ignoré hors Tauri");
      setData(null);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reporting_financier({ mama_id, debut: start, fin: end });
        setData(res);
      } catch (e) {
        setError(e.message || "Erreur chargement reporting financier");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [mama_id, start, end]);

  async function exportCsv(path) {
    if (!isTauri()) {
      console.info("useReportingFinancier: export ignoré hors Tauri");
      return;
    }
    if (!data) return;
    const csv = [
    "poste,montant",
    `Chiffre d'affaires,${data.total_ventes}`,
    `Achats,${data.total_achats}`,
    `Marge brute,${data.marge}`,
    `Valeur du stock,${data.valeur_stock}`].
    join("\n");
    await saveText(path, csv);
  }

  return { data, loading, error, exportCsv };
}

export default useReportingFinancier;