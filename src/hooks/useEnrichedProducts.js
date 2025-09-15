// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { query } from '@/local/db';import { isTauri } from "@/lib/runtime/isTauri";

export function useEnrichedProducts() {
  const { mama_id } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchEnrichedProducts() {
    setLoading(true);
    setError(null);
    try {
      const rows = await query(
        `SELECT p.id, p.nom, p.unite as unite_id, u.nom as unite_nom,
                p.famille as famille_id, f.nom as famille_nom,
                p.sous_famille_id, sf.nom as sous_famille_nom,
                fp.id as liaison_id, fp.fournisseur_id, fo.nom as fournisseur_nom,
                fp.code as liaison_code, fp.prix as liaison_prix
         FROM produits p
         LEFT JOIN unites u ON u.id = p.unite
         LEFT JOIN familles f ON f.id = p.famille
         LEFT JOIN sous_familles sf ON sf.id = p.sous_famille_id
         LEFT JOIN fournisseur_produits fp ON fp.produit_id = p.id
         LEFT JOIN fournisseurs fo ON fo.id = fp.fournisseur_id
         WHERE p.mama_id = ?
         ORDER BY p.nom`,
        [mama_id]
      );
      const map = new Map();
      for (const r of rows) {
        let item = map.get(r.id);
        if (!item) {
          item = {
            id: r.id,
            nom: r.nom,
            unite_id: r.unite_id,
            unite: r.unite_nom ? { nom: r.unite_nom } : null,
            famille_id: r.famille_id,
            famille: r.famille_nom ? { nom: r.famille_nom } : null,
            sous_famille_id: r.sous_famille_id,
            sous_famille: r.sous_famille_nom ? { nom: r.sous_famille_nom } : null,
            liaisons: []
          };
          map.set(r.id, item);
        }
        if (r.liaison_id) {
          item.liaisons.push({
            id: r.liaison_id,
            fournisseur_id: r.fournisseur_id,
            fournisseur: { nom: r.fournisseur_nom },
            code: r.liaison_code,
            prix: r.liaison_prix
          });
        }
      }
      setProducts(Array.from(map.values()));
    } catch (err) {
      setError(err.message || "Erreur chargement produits enrichis.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, fetchEnrichedProducts };
}