// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import {
  templates_commandes_list,
  templates_commandes_get,
  templates_commandes_create,
  templates_commandes_update,
  templates_commandes_delete,
  templates_commandes_get_for_fournisseur,
} from "@/local/templatesCommandes";

export async function getTemplatesCommandesActifs() {
  const data = await templates_commandes_list({ actif: true });
  return { data, error: null };
}

export async function fetchTemplates({ fournisseur_id } = {}) {
  const { mama_id } = useAuth();
  if (!mama_id) return { data: [], error: null };
  const data = await templates_commandes_list({ mama_id, fournisseur_id });
  return { data, error: null };
}

export async function getTemplateForFournisseur(fournisseur_id) {
  const { mama_id } = useAuth();
  if (!mama_id) return { data: null, error: "mama_id manquant" };
  const data = await templates_commandes_get_for_fournisseur(mama_id, fournisseur_id);
  return { data, error: null };
}

export function useTemplatesCommandes() {
  const { mama_id } = useAuth();

  return {
    fetchTemplates,

    fetchTemplateById: async (id) => {
      if (!mama_id) return { data: null, error: null };
      const data = await templates_commandes_get(id, mama_id);
      return { data, error: null };
    },

    createTemplate: async (payload) => {
      if (!mama_id) return { data: null, error: "mama_id manquant" };
      const data = await templates_commandes_create({ ...payload, mama_id });
      return { data, error: null };
    },

    updateTemplate: async (id, payload) => {
      if (!mama_id) return { data: null, error: "mama_id manquant" };
      const data = await templates_commandes_update(id, mama_id, payload);
      return { data, error: null };
    },

    deleteTemplate: async (id) => {
      if (!mama_id) return { error: "mama_id manquant" };
      await templates_commandes_delete(id, mama_id);
      return { error: null };
    },

    getTemplateForFournisseur
  };
}

export default useTemplatesCommandes;