// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import {
  permissions_list,
  permission_add,
  permission_update,
  permission_delete } from
'@/lib/db';
import { useState } from "react";

import { useAuth } from '@/hooks/useAuth';
import * as XLSX from "xlsx";
import { safeImportXLSX } from "@/lib/xlsx/safeImportXLSX";
import { saveAs } from "file-saver";import { isTauri } from "@/lib/tauriEnv";

export function usePermissions() {
  const { mama_id, role } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Récupérer toutes les permissions
  async function fetchPermissions({ roleId = null, userId = null } = {}) {
    if (!mama_id && role !== "superadmin") return [];
    setLoading(true);
    setError(null);
    try {
      const data = await permissions_list({
        mama_id: role !== "superadmin" ? mama_id : undefined,
        role_id: roleId,
        user_id: userId
      });
      setPermissions(Array.isArray(data) ? data : []);
      return data || [];
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  // 2. Ajouter une permission
  async function addPermission(permission) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await permission_add({ ...permission, mama_id });
      await fetchPermissions();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // 3. Modifier une permission
  async function updatePermission(id, updateFields) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await permission_update(id, updateFields);
      await fetchPermissions();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // 4. Supprimer une permission
  async function deletePermission(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await permission_delete(id);
      await fetchPermissions();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // 5. Export Excel
  function exportPermissionsToExcel() {
    const datas = (permissions || []).map((p) => ({
      id: p.id,
      role_id: p.role_id,
      user_id: p.user_id,
      droit: p.droit,
      actif: p.actif,
      mama_id: p.mama_id
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datas), "Permissions");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "permissions_mamastock.xlsx");
  }

  // 6. Import Excel
  async function importPermissionsFromExcel(file) {
    setLoading(true);
    setError(null);
    try {
      const arr = await safeImportXLSX(file, "Permissions");
      return arr;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    addPermission,
    updatePermission,
    deletePermission,
    exportPermissionsToExcel,
    importPermissionsFromExcel
  };
}