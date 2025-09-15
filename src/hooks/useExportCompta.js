// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV } from '@/lib/export/exportHelpers';
import { toast } from 'sonner';
import { compta_journal_lines, compta_mapping_list } from '@/lib/db';import { isTauri } from "@/lib/db/sql";

export default function useExportCompta() {
  const { mama_id } = useAuth();
  const [loading, setLoading] = useState(false);

  async function fetchJournalLines(month) {
    if (!mama_id) return [];
    const start = `${month}-01`;
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const endStr = end.toISOString().slice(0, 10);
    try {
      return await compta_journal_lines(mama_id, start, endStr);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function generateJournalCsv(month, download = true) {
    setLoading(true);
    const lignes = await fetchJournalLines(month);
    const rows = lignes.map((l) => {
      const ht = l.quantite * l.prix;
      const tva = ht * ((l.tva || 0) / 100);
      return {
        date: l.date_facture,
        fournisseur: l.fournisseur || '',
        ht,
        tva,
        ttc: ht + tva
      };
    });
    if (download) {
      exportToCSV(rows, { filename: `journal-achat-${month}.csv` });
      toast.success('Export généré');
    }
    setLoading(false);
    return rows;
  }

  async function mapFournisseursToTiers() {
    if (!mama_id) return {};
    try {
      const data = await compta_mapping_list(mama_id, 'fournisseur');
      const map = {};
      for (const row of data) map[row.cle] = row.compte;
      return map;
    } catch {
      return {};
    }
  }

  async function exportToERP(month, endpoint, token) {
    try {
      const rows = await generateJournalCsv(month, false);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ journal: rows })
      });
      if (!res.ok) throw new Error('API error');
      toast.success('Export envoyé');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi à l'ERP");
    }
  }

  return { generateJournalCsv, mapFournisseursToTiers, exportToERP, loading };
}