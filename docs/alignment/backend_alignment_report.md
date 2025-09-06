# Rapport d'alignement back-end

Ce rapport liste les structures de données référencées dans le front et leur statut dans la base locale SQLite.

## Tables principales détectées

| Table            | Colonnes clés (déd.)                                       | Statut         |
|------------------|------------------------------------------------------------|----------------|
| `utilisateurs`   | `email`, `mot_de_passe_hash`, `role`, `actif`              | utilisé / à créer |
| `fournisseurs`   | `nom`, `email`, `actif`                                    | utilisé / à créer |
| `produits`       | `nom`, `unite`, `famille`, `pmp`, `stock_theorique`        | utilisé / à créer |
| `factures`       | `fournisseur_id`, `date_iso`                               | utilisé / à créer |
| `facture_lignes` | `facture_id`, `produit_id`, `quantite`, `prix_unitaire`    | utilisé / à créer |

## Autres tables mentionnées

Le scan automatisé (`rg -o --no-filename "from\('([^']+)'\)" -r '$1' src`) a relevé 69 noms de tables ou vues supplémentaires (ex : `fiches`, `zones`, `taches`, `v_reco_stockmort`, ...). Ces structures ne sont pas encore supportées par le backend local et devront être ajoutées ultérieurement selon les besoins fonctionnels.

## Décisions de normalisation
- `produits.nom` et `fournisseurs.nom` uniques pour éviter les doublons.
- colonnes booléennes modélisées par `INTEGER` (0/1) comme `actif`.
- dates stockées en texte ISO (`date_iso`).

## Incompatibilités front ↔ data
- Le front fait toujours référence à Supabase; ces appels doivent être remplacés progressivement par le DAL local.
- Les tables non encore créées (ex. `fiches`, `zones`) provoqueront des erreurs si les vues associées sont utilisées hors-ligne.

