// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';
import { produits_list, fournisseurs_list, factures_list } from '@/lib/db';
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
  const [loading, setLoading] = useState(false);

  async function exportData({ type, format, options = {} }) {
    setLoading(true);
    try {
      let data = [];
      let columns = [];
      let filenameBase = type;
      if (type === 'produits') {
        const { rows } = await produits_list('', true, 1, 1000);
        data = rows.map(p => ({
          nom: p.nom,
          unite: p.unite || '',
          famille: p.famille || '',
        }));
        columns = [
          { key: 'nom', label: 'Nom' },
          { key: 'unite', label: 'Unité' },
          { key: 'famille', label: 'Famille' },
        ];
        filenameBase = 'produits';
      } else if (type === 'fournisseurs') {
        const { rows } = await fournisseurs_list('', 1000, 1);
        data = rows.map(f => ({
          nom: f.nom,
          email: f.email || '',
          actif: f.actif ? 'Oui' : 'Non',
        }));
        columns = [
          { key: 'nom', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'actif', label: 'Actif' },
        ];
        filenameBase = 'fournisseurs';
      } else if (type === 'factures') {
        const { rows } = await factures_list(options.start, options.end);
        data = rows.map(f => ({
          numero: f.numero,
          date_facture: f.date_facture,
          montant: f.montant,
        }));
        columns = [
          { key: 'numero', label: 'Numéro' },
          { key: 'date_facture', label: 'Date' },
          { key: 'montant', label: 'Montant' },
        ];
        filenameBase = 'factures';
      }

      const ext = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : format;
      const exportOptions = { ...options, columns, filename: `${filenameBase}.${ext}`, useDialog: true };

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
