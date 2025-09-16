// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';
import { useReportingFinancier } from '@/hooks/useReportingFinancier';
import StatCard from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';import { isTauri } from "@/lib/tauriEnv";

export default function Reporting() {
  const month = new Date().toISOString().slice(0, 7);
  const [period, setPeriod] = useState({ start: month + '-01', end: month + '-31' });
  const { data, loading, exportCsv } = useReportingFinancier(period);

  if (loading) return <LoadingSpinner message="Chargement..." />;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 text-mamastock-gold">Reporting financier</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="text-xs mr-2">Début</label>
          <input
            type="date"
            className="form-input"
            value={period.start}
            onChange={(e) => setPeriod((p) => ({ ...p, start: e.target.value }))} />
          
        </div>
        <div>
          <label className="text-xs mr-2">Fin</label>
          <input
            type="date"
            className="form-input"
            value={period.end}
            onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))} />
          
        </div>
        <button
          className="btn"
          onClick={() => exportCsv(`exports/compta_${period.start}_${period.end}.csv`)}>
          
          Export ERP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Chiffre d'affaires"
          value={data ? data.total_ventes.toLocaleString() + ' €' : '-'} />
        
        <StatCard
          label="Achats"
          value={data ? data.total_achats.toLocaleString() + ' €' : '-'} />
        
        <StatCard
          label="Marge brute"
          value={data ? data.marge.toLocaleString() + ' €' : '-'} />
        
        <StatCard
          label="Valeur du stock"
          value={data ? data.valeur_stock.toLocaleString() + ' €' : '-'} />
        
      </div>
    </div>);

}