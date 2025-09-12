// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { facture_create, facture_add_ligne } from "@/lib/db";

export function useInvoiceImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function importFromFile(file) {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const id = await facture_create({
        numero: payload.numero,
        fournisseur_id: payload.fournisseur_id,
        date_iso: payload.date_iso,
        montant: payload.montant,
        statut: payload.statut,
      });
      for (const l of payload.lignes || []) {
        await facture_add_ligne({
          facture_id: id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
        });
      }
      setLoading(false);
      return id;
    } catch (err) {
      setLoading(false);
      setError(err.message || err);
      return null;
    }
  }

  return { importFromFile, loading, error };
}