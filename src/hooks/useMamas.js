// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";

import { useAuth } from '@/hooks/useAuth';
import { readConfig, writeConfig } from '@/appFs';
import * as XLSX from "xlsx";
import { safeImportXLSX } from "@/lib/xlsx/safeImportXLSX";
import { saveAs } from "file-saver";import { isTauri } from "@/lib/db/sql";

export function useMamas() {
  const { mama_id, role } = useAuth();
  const [mamas, setMamas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Récupérer tous les établissements (tous si superadmin, sinon accès limité)
  async function fetchMamas({ search = "" } = {}) {
    setLoading(true);
    setError(null);
    try {
      const cfg = (await readConfig()) || {};
      let list = Array.isArray(cfg.mamas) ? cfg.mamas : [];
      if (role !== "superadmin" && mama_id) {
        list = list.filter((m) => m.id === mama_id);
      }
      if (search) {
        const low = search.toLowerCase();
        list = list.filter((m) => (m.nom || '').toLowerCase().includes(low));
      }
      list.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
      setMamas(list);
      return list;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function saveMamas(newList) {
    const cfg = (await readConfig()) || {};
    cfg.mamas = newList;
    await writeConfig(cfg);
  }

  // 2. Ajouter un établissement
  async function addMama(mama) {
    if (role !== "superadmin") return { error: "Action non autorisée" };
    setLoading(true);
    setError(null);
    try {
      const list = [...mamas];
      const item = { id: mama.id || crypto.randomUUID(), ...mama };
      list.push(item);
      await saveMamas(list);
      setMamas(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // 3. Modifier un établissement
  async function updateMama(id, updateFields) {
    if (role !== "superadmin" && id !== mama_id) {
      return { error: "Action non autorisée" };
    }
    setLoading(true);
    setError(null);
    try {
      const list = mamas.map((m) =>
      m.id === id ? { ...m, ...updateFields } : m
      );
      await saveMamas(list);
      setMamas(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // 4. Activer/désactiver un établissement
  async function toggleMamaActive(id, actif) {
    if (role !== "superadmin" && id !== mama_id) {
      return { error: "Action non autorisée" };
    }
    setLoading(true);
    setError(null);
    try {
      const list = mamas.map((m) =>
      m.id === id ? { ...m, actif } : m
      );
      await saveMamas(list);
      setMamas(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }



  // 5. Export Excel
  function exportMamasToExcel() {
    const datas = (mamas || []).map((m) => ({
      id: m.id,
      nom: m.nom,
      ville: m.ville,
      email: m.email
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datas), "Mamas");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "mamas_mamastock.xlsx");
  }

  // 6. Import Excel
  async function importMamasFromExcel(file) {
    setLoading(true);
    setError(null);
    try {
      const arr = await safeImportXLSX(file, "Mamas");
      return arr;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    mamas,
    loading,
    error,
    fetchMamas,
    addMama,
    updateMama,
    toggleMamaActive,
    exportMamasToExcel,
    importMamasFromExcel
  };
}