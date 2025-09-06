// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import supabase from '@/lib/supabase';
import { useState } from 'react';

// useAuth est renommé pour éviter un conflit avec l'alias d'export ci-dessous
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportToTSV,
  exportToJSON,
  exportToXML,
  exportToHTML,
  exportToMarkdown,
  exportToYAML,
  exportToTXT,
  exportToClipboard,
  printView } from
'@/lib/export/exportHelpers';
import { toast } from 'sonner';

export default function useExport() {
  const { mama_id } = useAuthHook();
  const [loading, setLoading] = useState(false);

  async function exportData({ type, format, options = {} }) {
    if (!mama_id) return null;
    setLoading(true);
    try {
      let data = [];
      let columns = [];
      let filenameBase = type;
      if (type === 'fiches') {
        const res = await supabase
          .from('fiches_techniques')
          .select('*')
          .eq('mama_id', mama_id);
        data = res.data || [];
      } else if (type === 'inventaire') {
        const res = await supabase
          .from('inventaires')
          .select('*, lignes:produits_inventaire!inventaire_id(*)')
          .eq('mama_id', mama_id);
        data = res.data || [];
      } else if (type === 'produits') {
        const res = await supabase
          .from('produits')
          .select('nom, unite:unites!fk_produits_unite(nom), famille:familles!fk_produits_famille(nom)')
          .eq('mama_id', mama_id);
        data = (res.data || []).map(p => ({
          nom: p.nom,
          unite: p.unite?.nom || '',
          famille: p.famille?.nom || '',
        }));
        columns = [
          { key: 'nom', label: 'Nom' },
          { key: 'unite', label: 'Unité' },
          { key: 'famille', label: 'Famille' },
        ];
        filenameBase = 'produits';
      } else if (type === 'fournisseurs') {
        const res = await supabase
          .from('fournisseurs')
          .select('nom, contact_nom, contact_email, contact_tel')
          .eq('mama_id', mama_id);
        data = res.data || [];
        columns = [
          { key: 'nom', label: 'Nom' },
          { key: 'contact_tel', label: 'Téléphone' },
          { key: 'contact_nom', label: 'Contact' },
          { key: 'contact_email', label: 'Email' },
        ];
        filenameBase = 'fournisseurs';
      } else if (type === 'factures') {
        let query = supabase
          .from('factures')
          .select('numero, date_facture, montant')
          .eq('mama_id', mama_id);
        if (options.start) query = query.gte('date_facture', options.start);
        if (options.end) query = query.lte('date_facture', options.end);
        const res = await query;
        data = res.data || [];
        columns = [
          { key: 'numero', label: 'Numéro' },
          { key: 'date_facture', label: 'Date' },
          { key: 'montant', label: 'Montant' },
        ];
        filenameBase = 'factures';
      }

      const ext = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : format;
      const exportOptions = { ...options, columns, filename: `${filenameBase}.${ext}` };

      if (format === 'pdf') await exportToPDF(data, exportOptions); else
      if (format === 'excel') await exportToExcel(data, exportOptions); else
      if (format === 'csv') await exportToCSV(data, exportOptions); else
      if (format === 'tsv') await exportToTSV(data, exportOptions); else
      if (format === 'json') await exportToJSON(data, exportOptions); else
      if (format === 'xml') await exportToXML(data, exportOptions); else
      if (format === 'html') await exportToHTML(data, exportOptions); else
      if (format === 'markdown') await exportToMarkdown(data, exportOptions); else
      if (format === 'yaml') await exportToYAML(data, exportOptions); else
      if (format === 'txt') await exportToTXT(data, exportOptions); else
      if (format === 'clipboard') await exportToClipboard(data, exportOptions); else
      if (format === 'print') printView(options.content);

      toast.success('Export effectué');
      return data;
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'export');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { exportData, loading };
}

// Certains tests attendent que ce hook soit également exposé sous le nom useAuth
// on ré-exporte donc le hook pour maintenir la compatibilité.
export { useExport as useAuth };