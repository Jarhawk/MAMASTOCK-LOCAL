// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";
import { useConsolidation } from "@/hooks/useConsolidation";
import { Button } from "@/components/ui/button";
import TableContainer from "@/components/ui/TableContainer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";import { isTauri } from "@/lib/tauriEnv";

export default function Consolidation() {
  const {
    sites,
    rows,
    loading,
    fetchSites,
    fetchConsoMensuelle,
    exportExcel,
    exportPdf,
    getKpis
  } = useConsolidation();
  const [selected, setSelected] = useState([]);
  const [period, setPeriod] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleSelect = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelected(opts);
  };

  const load = () => {
    fetchConsoMensuelle({ mamaIds: selected, start: period.start, end: period.end });
  };

  const kpis = getKpis(rows);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Consolidation</h1>
      <div className="flex flex-col md:flex-row gap-2">
        <select
          multiple
          value={selected}
          onChange={handleSelect}
          className="border p-1 flex-1 min-h-[5rem]">
          
          {sites.map((s) =>
          <option key={s.mama_id} value={s.mama_id}>
              {s.mama_id}
            </option>
          )}
        </select>
        <input
          type="month"
          value={period.start}
          onChange={(e) => setPeriod((p) => ({ ...p, start: e.target.value }))}
          className="border p-1" />
        
        <input
          type="month"
          value={period.end}
          onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))}
          className="border p-1" />
        
        <Button onClick={load}>Charger</Button>
        <Button variant="outline" onClick={() => exportExcel(rows)}>
          Excel
        </Button>
        <Button variant="outline" onClick={() => exportPdf(rows)}>
          PDF
        </Button>
      </div>
      <div className="flex gap-4 text-sm">
        <div>CA: {kpis.ca}</div>
        <div>Achats: {kpis.achats}</div>
        <div>Marge: {kpis.marge}</div>
        <div>Stock: {kpis.stock}</div>
      </div>
      {loading ?
      <LoadingSpinner message="Chargement..." /> :

      <TableContainer>
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th>Site</th>
                <th>CA</th>
                <th>Achats</th>
                <th>Marge</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
            <tr key={r.mama_id}>
                  <td>{r.mama_id}</td>
                  <td>{r.total_ventes}</td>
                  <td>{r.total_achats}</td>
                  <td>{r.marge}</td>
                  <td>{r.valeur_stock}</td>
                </tr>
            )}
            </tbody>
          </table>
        </TableContainer>
      }
    </div>);

}