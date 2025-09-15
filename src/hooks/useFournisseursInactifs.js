// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { fournisseurs_inactifs } from "@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";

export function useFournisseursInactifs() {
  const [fournisseurs, setFournisseurs] = useState([]);

  async function fetchInactifs() {
    const rows = await fournisseurs_inactifs();
    setFournisseurs(Array.isArray(rows) ? rows : []);
    return rows || [];
  }

  return { fournisseurs, fetchInactifs };
}