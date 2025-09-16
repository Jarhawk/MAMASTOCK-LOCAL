// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { readConfig } from "@/appFs";
import { facture_create, facture_add_ligne } from "@/lib/db";import { isTauri } from "@/lib/tauriEnv";

export function useFournisseurAPI() {
  const { mama_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getConfig(fournisseur_id) {
    if (!mama_id || !fournisseur_id) return null;
    const cfg = (await readConfig()) || {};
    const list = cfg.fournisseurs_api_config || [];
    const data = list.find(
      (c) => c.mama_id === mama_id && c.fournisseur_id === fournisseur_id
    );
    if (!data) {
      setError("missing_config");
      toast.error("Configuration API introuvable");
      return null;
    }
    if (!data.token && data.type_api !== "ftp") {
      setError("missing_token");
      toast.error("Token API manquant");
      return null;
    }
    return data;
  }

  async function testConnection(fournisseur_id) {
    const config = await getConfig(fournisseur_id);
    if (!config) return false;
    setLoading(true);
    try {
      const res = await fetch(`${config.url}/ping`, {
        headers: { Authorization: `Bearer ${config.token}` }
      });
      return res.ok;
    } catch (err) {
      setError(err);
      toast.error("Erreur test connexion");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function importFacturesFournisseur(fournisseur_id) {
    const config = await getConfig(fournisseur_id);
    if (!config) return [];
    setLoading(true);
    try {
      const res = await fetch(`${config.url}/factures`, {
        headers: { Authorization: `Bearer ${config.token}` }
      });
      const factures = await res.json();
      for (const ft of factures) {
        const id = await facture_create({
          numero: ft.numero,
          fournisseur_id,
          date_iso: ft.date_iso || ft.date,
          montant: ft.montant || null,
          statut: ft.statut || null
        });
        if (Array.isArray(ft.lignes)) {
          for (const l of ft.lignes) {
            await facture_add_ligne({
              facture_id: id,
              produit_id: l.produit_id,
              quantite: l.quantite,
              prix_unitaire: l.prix_unitaire
            });
          }
        }
      }
      toast.success("Factures importées");
      return factures;
    } catch (err) {
      setError(err);
      toast.error("Erreur import factures");
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function syncCatalogue(fournisseur_id) {
    const config = await getConfig(fournisseur_id);
    if (!config) return [];
    setLoading(true);
    try {
      const res = await fetch(`${config.url}/catalogue`, {
        headers: { Authorization: `Bearer ${config.token}` }
      });
      const produits = await res.json();
      toast.success("Catalogue synchronisé");
      return produits;
    } catch (err) {
      setError(err);
      toast.error("Erreur sync catalogue");
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function envoyerCommande(commande) {
    if (!mama_id || !commande) return { error: "missing data" };
    const config = await getConfig(commande.fournisseur_id);
    if (!config) return { error: "config" };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.url}/commandes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`
        },
        body: JSON.stringify(commande)
      });
      const body = await res.json();
      toast.success("Commande envoyée");
      return { data: body };
    } catch (err) {
      setError(err);
      toast.error("Erreur envoi commande");
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function getCommandeStatus(commande_id, fournisseur_id) {
    if (!mama_id || !commande_id || !fournisseur_id) return { error: "missing data" };
    const config = await getConfig(fournisseur_id);
    if (!config) return { error: "config" };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.url}/commandes/${commande_id}/status`, {
        headers: { Authorization: `Bearer ${config.token}` }
      });
      const body = await res.json();
      return { data: body };
    } catch (err) {
      setError(err);
      toast.error("Erreur statut commande");
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  async function cancelCommande(commande_id, fournisseur_id) {
    if (!mama_id || !commande_id || !fournisseur_id) return { error: "missing data" };
    const config = await getConfig(fournisseur_id);
    if (!config) return { error: "config" };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.url}/commandes/${commande_id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`
        }
      });
      const body = await res.json();
      toast.success("Commande annulée");
      return { data: body };
    } catch (err) {
      setError(err);
      toast.error("Erreur annulation commande");
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    importFacturesFournisseur,
    syncCatalogue,
    envoyerCommande,
    getCommandeStatus,
    cancelCommande,
    testConnection
  };
}