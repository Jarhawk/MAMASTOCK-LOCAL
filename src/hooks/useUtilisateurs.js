// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { listLocalUsers, registerLocal, updateRoleLocal, deleteUserLocal } from "@/auth/localAccount";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { exportToCSV } from "@/lib/export/exportHelpers";
import { DEFAULT_ROLES } from "@/constants/roles";
import { safeImportXLSX } from "@/lib/xlsx/safeImportXLSX";import { isTauri } from "@/lib/db/sql";

export function useUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getUtilisateurs() {
    setLoading(true);
    setError(null);
    try {
      const data = await listLocalUsers();
      setUsers(data);
      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    setRoles(DEFAULT_ROLES);
    return DEFAULT_ROLES;
  }

  async function createUtilisateur({ email, password = "changeme", role_id = "chef_site" }) {
    try {
      await registerLocal(email, password, role_id);
      await getUtilisateurs();
      return {};
    } catch (err) {
      return { error: err };
    }
  }

  async function updateUser(id, { role_id }) {
    try {
      if (role_id) await updateRoleLocal(id, role_id);
      await getUtilisateurs();
    } catch (err) {
      setError(err);
    }
  }

  async function toggleUserActive(id, actif) {
    // Les comptes locaux n'ont pas de champ actif ; placeholder
    return { id, actif };
  }

  async function deleteUser(id) {
    await deleteUserLocal(id);
    await getUtilisateurs();
  }

  function exportUsersToExcel(data = users) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Utilisateurs");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "utilisateurs_mamastock.xlsx");
  }

  function exportUsersToCSV(data = users) {
    exportToCSV(data, { filename: "utilisateurs_mamastock.csv" });
  }

  async function importUsersFromExcel(file) {
    setLoading(true);
    setError(null);
    try {
      const arr = await safeImportXLSX(file, "Utilisateurs");
      return arr;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  function resetPassword() {
    return { error: "Non disponible hors ligne" };
  }

  return {
    users,
    roles,
    loading,
    error,
    getUtilisateurs,
    fetchRoles,
    createUtilisateur,
    addUser: createUtilisateur,
    updateUser,
    updateUtilisateur: updateUser,
    toggleUserActive,
    deleteUser,
    deleteUtilisateur: deleteUser,
    resetPassword,
    exportUsersToExcel,
    exportUsersToCSV,
    importUsersFromExcel
  };
}