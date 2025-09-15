// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  fiches_list,
  fiche_get,
  fiches_create,
  fiches_update,
  fiches_delete,
  fiches_duplicate } from
'@/lib/db';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSPDF from "jspdf";
import "jspdf-autotable";import { isTauri } from "@/lib/db/sql";

export function useFiches() {
  const { mama_id } = useAuth();
  const [fiches, setFiches] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getFiches({ search = "", actif = null, famille = null, page = 1, limit = 20, sortBy = "nom", asc = true } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    const sortField = ["nom", "cout_par_portion"].includes(sortBy) ? sortBy : "nom";
    try {
      const { rows, total } = await fiches_list(mama_id, {
        search,
        actif,
        famille,
        page,
        limit,
        sortBy: sortField,
        asc
      });
      setFiches(rows);
      setTotal(total);
      return rows;
    } catch (err) {
      console.error('getFiches error:', err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getFicheById(id) {
    if (!id || !mama_id) return null;
    setLoading(true);
    try {
      return await fiche_get(id, mama_id);
    } catch (err) {
      console.error('getFicheById error:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createFiche({ lignes = [], ...fiche }) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      const id = await fiches_create({ ...fiche, mama_id }, lignes);
      setFiches((prev) => [{ id, ...fiche }, ...prev]);
      setTotal((prev) => prev + 1);
      return { data: id };
    } catch (err) {
      console.error('createFiche error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function updateFiche(id, { lignes = [], ...fiche }) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await fiches_update(id, mama_id, fiche, lignes);
      setFiches((prev) => prev.map((f) => f.id === id ? { ...f, ...fiche } : f));
      return { data: id };
    } catch (err) {
      console.error('updateFiche error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function deleteFiche(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await fiches_delete(id, mama_id);
      setFiches((prev) => prev.filter((f) => f.id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
      return { data: id };
    } catch (err) {
      console.error('deleteFiche error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function duplicateFiche(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      const newId = await fiches_duplicate(id, mama_id);
      if (newId) {
        const fiche = await fiche_get(newId, mama_id);
        if (fiche) {
          setFiches((prev) => [...prev, fiche]);
          setTotal((prev) => prev + 1);
        }
      }
      return { data: newId };
    } catch (err) {
      console.error('duplicateFiche error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  function exportFichesToExcel() {
    const datas = (fiches || []).map((f) => ({
      id: f.id,
      nom: f.nom,
      portions: f.portions,
      cout_total: f.cout_total,
      cout_par_portion: f.cout_par_portion,
      actif: f.actif
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datas), "Fiches");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "fiches_mamastock.xlsx");
  }

  function exportFichesToPDF() {
    const doc = new JSPDF();
    const rows = (fiches || []).map((f) => [
    f.nom,
    f.famille?.nom || "",
    f.portions,
    f.cout_par_portion]
    );
    doc.autoTable({ head: [["Nom", "Famille", "Portions", "Coût/portion"]], body: rows });
    doc.save("fiches_mamastock.pdf");
  }

  return { fiches, total, loading, error, getFiches, getFicheById, createFiche, updateFiche, deleteFiche, duplicateFiche, exportFichesToExcel, exportFichesToPDF };
}