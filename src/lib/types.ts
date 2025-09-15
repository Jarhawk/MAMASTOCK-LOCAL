import { isTauri } from "@/lib/runtime/isTauri";export interface User {
  id: number;
  email: string;
  mot_de_passe_hash: string;
  role: string;
  actif: number;
}

export interface Fournisseur {
  id: number;
  nom: string;
  email?: string | null;
  actif: number;
}

export interface Produit {
  id: number;
  nom: string;
  unite?: string | null;
  famille?: string | null;
  actif: number;
  pmp: number;
  stock_theorique: number;
  valeur_stock: number;
  unite_id?: number | null;
  famille_id?: number | null;
  sous_famille_id?: number | null;
  stock_min: number;
  zone_id?: number | null;
}

export interface Facture {
  id: number;
  fournisseur_id: number;
  date_iso: string;
}

export interface FactureLigne {
  id: number;
  facture_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
}

export interface Recette {
  id: number;
  nom: string;
  description?: string | null;
  actif: number;
}

export interface Inventaire {
  id: number;
  date_iso: string;
  zone_id?: number | null;
  reference?: string | null;
  cloture: number;
}

export interface Tache {
  id: number;
  titre: string;
  description?: string | null;
  complete: number;
}