// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";

export function useMenuDuJour() {
  const [menusDuJour, setMenus] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchMenusDuJour() {
    setMenus([]);
    setTotal(0);
    return [];
  }

  const noop = async () => {};

  return {
    menusDuJour,
    total,
    loading,
    error,
    fetchMenusDuJour,
    addMenuDuJour: noop,
    editMenuDuJour: noop,
    deleteMenuDuJour: noop,
    exportMenusDuJourToExcel: () => {},
    fetchSemaineMenus: async () => [],
    fetchMenuForDate: async () => ({}),
    setFicheForCategorie: noop,
    setPortions: noop,
    removeFicheFromMenu: noop,
    duplicateMenu: noop,
    reloadSavedFiches: async () => ({}),
    fetchWeek: async () => [],
    fetchDay: async () => ({ menu: null, lignes: [] }),
    createOrUpdateMenu: async () => ({ id: null }),
    addLigne: noop,
    removeLigne: noop,
    duplicateDay: noop,
    loadFromFavoris: noop,
    exportExcel: () => {},
    exportPdf: () => {},
    getMonthlyAverageFoodCost: async () => null,
  };
}

export default useMenuDuJour;
