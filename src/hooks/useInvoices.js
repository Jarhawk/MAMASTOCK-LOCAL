// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import {
  factures_list,
  factures_by_fournisseur,
  facture_get,
  facture_create,
  facture_update,
  facture_delete,
  factures_update_status } from
"@/lib/db";
import * as XLSX from "xlsx";
import { safeImportXLSX } from "@/lib/xlsx/safeImportXLSX";
import { saveAs } from "file-saver";import { isTauri } from "@/lib/tauriEnv";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Charger toutes les factures (avec fournisseur, filtrage)
  async function fetchInvoices({ search = "", fournisseur = "", statut = "" } = {}) {
    setLoading(true);
    setError(null);
    try {
      const { factures } = await factures_list({
        search,
        fournisseur_id: fournisseur || undefined,
        statut
      });
      setInvoices(factures || []);
      return factures;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  // 2. Factures par fournisseur
  async function fetchFacturesByFournisseur(fournisseur_id) {
    if (!fournisseur_id) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await factures_by_fournisseur(fournisseur_id);
      return rows;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  // 3. Charger une facture par id
  async function fetchInvoiceById(id) {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const row = await facture_get(id);
      return row;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // 4. Ajouter une facture
  async function addInvoice(invoice) {
    setLoading(true);
    setError(null);
    try {
      await facture_create(invoice);
      await fetchInvoices();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // 5. Modifier une facture
  async function updateInvoice(id, updateFields) {
    setLoading(true);
    setError(null);
    try {
      await facture_update(id, updateFields);
      await fetchInvoices();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // 6. Supprimer une facture
  async function deleteInvoice(id) {
    setLoading(true);
    setError(null);
    try {
      await facture_delete(id);
      await fetchInvoices();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // 7. Batch statut
  async function batchUpdateStatus(ids = [], statut) {
    setLoading(true);
    setError(null);
    try {
      await factures_update_status(ids, statut);
      await fetchInvoices();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // 8. Export Excel
  function exportInvoicesToExcel() {
    const datas = (invoices || []).map((f) => ({
      id: f.id,
      numero: f.numero,
      date: f.date_iso,
      fournisseur: f.fournisseur_nom,
      montant: f.montant,
      statut: f.statut
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datas), "Factures");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "factures_mamastock.xlsx");
  }

  // 9. Import Excel
  async function importInvoicesFromExcel(file) {
    setLoading(true);
    setError(null);
    try {
      const arr = await safeImportXLSX(file, "Factures");
      return arr;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    fetchFacturesByFournisseur,
    fetchInvoiceById,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    batchUpdateStatus,
    exportInvoicesToExcel,
    importInvoicesFromExcel
  };
}