# QA

Parcours manuel pour valider une release candidate.

1. Se connecter avec un compte valide.
2. Créer un fournisseur.
3. Créer un produit.
4. Émettre une facture pour ce fournisseur avec une ligne :
   - quantité : 10
   - prix unitaire : 2.5
5. Vérifier que le PMP du produit est de 2.5 et que le stock est de 10.
6. Exporter les produits en CSV.
7. Sauvegarder la base de données.
8. Restaurer cette sauvegarde.

