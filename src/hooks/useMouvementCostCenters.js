// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";

import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from "@/hooks/useAuditLog";
import { readText, saveText, existsFile } from "@/local/files";
import { readCostCenters } from "@/local/costCenters";

const FILE_PATH = "config/cost_center_allocations.json";

async function readAllocations() {
  if (!(await existsFile(FILE_PATH))) return [];
  try {
    const txt = await readText(FILE_PATH);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAllocations(list) {
  await saveText(FILE_PATH, JSON.stringify(list, null, 2));
}

export function useMouvementCostCenters() {
  const { mama_id } = useAuth();
  const { log } = useAuditLog();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchAllocations(mouvement_id) {
    if (!mouvement_id) return [];
    setLoading(true);
    setError(null);
    try {
      const all = await readAllocations();
      const rows = all.filter((a) => a.mouvement_id === mouvement_id && a.mama_id === mama_id);
      const centres = await readCostCenters();
      const nameMap = new Map(centres.map((c) => [c.id, c.nom]));
      const enriched = rows.map((r) => ({
        ...r,
        centres_de_cout: { nom: nameMap.get(r.cost_center_id) || "" },
      }));
      setAllocations(enriched);
      return enriched;
    } catch (err) {
      setError(err?.message || String(err));
      setAllocations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function saveAllocations(mouvement_id, rows) {
    if (!mouvement_id) return;
    setLoading(true);
    setError(null);
    try {
      const all = await readAllocations();
      const filtered = all.filter((a) => !(a.mouvement_id === mouvement_id && a.mama_id === mama_id));
      const prepared = (rows || []).map((r) => ({
        id: crypto.randomUUID(),
        mouvement_id,
        cost_center_id: r.cost_center_id,
        quantite: Number(r.quantite) || 0,
        valeur: r.valeur ? Number(r.valeur) : null,
        mama_id,
      }));
      const next = [...filtered, ...prepared];
      await writeAllocations(next);
      await log("Ventilation mouvement", { mouvement_id, rows: prepared });
      await fetchAllocations(mouvement_id);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return { allocations, loading, error, fetchAllocations, saveAllocations };
}
