# QA

Parcours manuel pour valider une release candidate Windows.

1. Lancer l'application puis se connecter avec l'administrateur créé via `npm run seed:admin`.
2. Créer un fournisseur.
3. Créer un produit.
4. Émettre une facture pour ce fournisseur avec une ligne :
   - quantité : 10
   - prix unitaire : 2.5
5. Vérifier que le PMP du produit est de 2.5 et que le stock est de 10.
6. Exporter les produits en CSV **et** en XLSX puis vérifier que les fichiers sont présents.
7. Sauvegarder la base de données, restaurer cette sauvegarde et vérifier le redémarrage de l'application.
8. Tester le verrou distribué : une instance A est ouverte, démarrer une instance B → A se ferme et B prend la main.
