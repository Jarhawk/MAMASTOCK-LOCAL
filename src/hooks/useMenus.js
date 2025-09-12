// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";

export async function importMenusFromExcel(file, sheetName) {
  const buf = await file.arrayBuffer();
  const wb = await import("xlsx");
  const book = wb.read(buf, { type: "array" });
  const pick = sheetName && book.Sheets[sheetName] ? sheetName : book.SheetNames[0];
  const ws = book.Sheets[pick];
  return ws ? wb.utils.sheet_to_json(ws) : [];
}

export function useMenus() {
  const [menus, setMenus] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getMenus() {
    setLoading(true);
    setError(null);
    setMenus([]);
    setTotal(0);
    setLoading(false);
    return [];
  }

  async function createMenu() {
    return { error: "Non disponible hors ligne" };
  }

  async function updateMenuData() {
    return { error: "Non disponible hors ligne" };
  }

  async function getMenuById() {
    return null;
  }

  async function deleteMenu() {}

  async function toggleMenuActive() {}

  function exportMenusToExcel() {}

  async function importMenusFromExcelWithState(file, sheetName = "Menus") {
    try {
      return await importMenusFromExcel(file, sheetName);
    } catch (err) {
      setError(err);
      return [];
    }
  }

  return {
    menus,
    total,
    loading,
    error,
    getMenus,
    createMenu,
    updateMenuData,
    getMenuById,
    deleteMenu,
    toggleMenuActive,
    exportMenusToExcel,
    importMenusFromExcelWithState,
  };
}

export default useMenus;
