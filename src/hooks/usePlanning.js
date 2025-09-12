// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { readText, saveText, existsFile } from "@/local/files";
import { useAuth } from '@/hooks/useAuth';

const FILE_PATH = "planning.json";

async function readAll() {
  if (!(await existsFile(FILE_PATH))) return [];
  try {
    const txt = await readText(FILE_PATH);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list) {
  await saveText(FILE_PATH, JSON.stringify(list, null, 2));
}

export function usePlanning() {
  const { mama_id } = useAuth();

  async function getPlannings({ statut = "", debut = "", fin = "" } = {}) {
    if (!mama_id) return { data: [] };
    try {
      const all = await readAll();
      const filt = all.filter((p) =>
        p.mama_id === mama_id &&
        (!statut || p.statut === statut) &&
        (!debut || p.date_prevue >= debut) &&
        (!fin || p.date_prevue <= fin)
      );
      return { data: filt };
    } catch (err) {
      console.error("getPlannings", err);
      return { data: [] };
    }
  }

  async function getPlanningById(id) {
    if (!id || !mama_id) return null;
    const all = await readAll();
    return all.find((p) => p.id === id && p.mama_id === mama_id) || null;
  }

  async function createPlanning({ nom, date_prevue, commentaire = "", statut = "prévu", lignes = [] }) {
    if (!mama_id) return { error: new Error("mama_id manquant") };
    try {
      const all = await readAll();
      const id = crypto.randomUUID();
      const plan = {
        id,
        mama_id,
        nom,
        date_prevue,
        commentaire,
        statut,
        actif: true,
        lignes: lignes.map((l) => ({ id: crypto.randomUUID(), ...l })),
        created_at: new Date().toISOString(),
      };
      all.push(plan);
      await writeAll(all);
      return { data: { id } };
    } catch (error) {
      return { error };
    }
  }

  async function updatePlanning(id, fields) {
    if (!mama_id) return { error: new Error("mama_id manquant") };
    try {
      const all = await readAll();
      const idx = all.findIndex((p) => p.id === id && p.mama_id === mama_id);
      if (idx === -1) throw new Error("Planning introuvable");
      all[idx] = { ...all[idx], ...fields };
      await writeAll(all);
      return { data: all[idx] };
    } catch (error) {
      return { error };
    }
  }

  async function deletePlanning(id) {
    if (!mama_id) return { error: new Error("mama_id manquant") };
    try {
      const all = await readAll();
      const filt = all.filter((p) => !(p.id === id && p.mama_id === mama_id));
      await writeAll(filt);
      return { data: true };
    } catch (error) {
      return { error };
    }
  }

  // aliases for backward compatibility
  async function fetchPlanning({ start, end, statut } = {}) {
    const { data } = await getPlannings({
      statut,
      debut: start,
      fin: end,
    });
    return data;
  }
  const addPlanning = createPlanning;

  return {
    getPlannings,
    getPlanningById,
    createPlanning,
    updatePlanning,
    deletePlanning,
    fetchPlanning,
    addPlanning,
  };
}

export default usePlanning;