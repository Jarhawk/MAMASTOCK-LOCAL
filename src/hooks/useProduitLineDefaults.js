// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { getDb } from '@/lib/db';

// Returns defaults for an invoice line when a product is selected.
// In the local offline mode we only provide PMP from the produits table.

export function useProduitLineDefaults() {
  const fetchDefaults = async ({ produit_id } = {}) => {
    if (!produit_id) return { unite_id: null, unite: '', pmp: 0 };
    try {
      const db = await getDb();
      const rows = await db.select('SELECT pmp FROM produits WHERE id = ? LIMIT 1', [produit_id]);
      const pmp = Number(rows[0]?.pmp ?? 0);
      return { unite_id: null, unite: '', pmp };
    } catch {
      return { unite_id: null, unite: '', pmp: 0 };
    }
  };

  return { fetchDefaults };
}

export default useProduitLineDefaults;

