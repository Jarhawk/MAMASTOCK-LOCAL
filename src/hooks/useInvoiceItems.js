import { useState } from "react";
import {
  facture_lignes_by_facture,
  facture_ligne_get,
  facture_add_ligne,
  facture_ligne_update,
  facture_ligne_delete,
} from "@/lib/db";

export function useInvoiceItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchItemsByInvoice(invoiceId) {
    if (!invoiceId) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await facture_lignes_by_facture(invoiceId);
      setItems(rows);
      return rows;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchItemById(id) {
    if (!id) return null;
    try {
      return await facture_ligne_get(id);
    } catch (e) {
      setError(e);
      return null;
    }
  }

  async function addItem(invoiceId, item) {
    if (!invoiceId) return { error: "no invoice" };
    try {
      await facture_add_ligne({ facture_id: invoiceId, ...item });
      return { error: null };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  async function updateItem(id, fields) {
    if (!id) return { error: "no id" };
    try {
      await facture_ligne_update(id, fields);
      return { error: null };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  async function deleteItem(id) {
    if (!id) return { error: "no id" };
    try {
      await facture_ligne_delete(id);
      return { error: null };
    } catch (e) {
      setError(e);
      return { error: e };
    }
  }

  return {
    items,
    loading,
    error,
    fetchItemsByInvoice,
    fetchItemById,
    addItem,
    updateItem,
    deleteItem,
  };
}