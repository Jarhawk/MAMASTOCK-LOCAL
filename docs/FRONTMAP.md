# FRONTMAP

## Résumé du projet
- Node: >=18
- Vite: 7.1.3
- Tauri (CLI): ^2.8.4

## Routes & navigation

| Chemin | Composant | Fichier | Lazy | Protégé |
|---|---|---|---|---|
| / | RootRoute |  | non | non |
| /accueil | Accueil | @/pages/Accueil.jsx | oui | non |
| /signup | Signup | @/pages/public/Signup.jsx | oui | non |
| /login | Login |  | non | non |
| /reset-password | ResetPassword |  | non | non |
| /update-password | UpdatePassword |  | non | non |
| /logout | Logout | @/pages/auth/Logout.jsx | oui | non |
| /onboarding | Onboarding | @/pages/public/Onboarding.jsx | oui | non |
| /create-mama | CreateMama | @/pages/auth/CreateMama.jsx | oui | non |
| /pending | Pending |  | non | non |
| /unauthorized | Unauthorized |  | non | non |
| /blocked | Blocked |  | non | non |
| /onboarding-utilisateur | OnboardingUtilisateur |  | non | non |
| /rgpd | Rgpd | @/pages/Rgpd.jsx | oui | non |
| /confidentialite | Confidentialite | @/pages/legal/Confidentialite.jsx | oui | non |
| /mentions-legales | MentionsLegales | @/pages/legal/MentionsLegales.jsx | oui | non |
| /cgu | Cgu | @/pages/legal/Cgu.jsx | oui | non |
| /cgv | Cgv | @/pages/legal/Cgv.jsx | oui | non |
| /contact | Contact | @/pages/legal/Contact.jsx | oui | non |
| /licence | Licence | @/pages/legal/Licence.jsx | oui | non |
| /debug/auth | DebugAuth |  | non | non |
| /debug/rights | DebugRights |  | non | non |
| / | Layout |  | non | non |
| dashboard | Dashboard | @/pages/Dashboard.jsx | oui | non |
| /dashboard/builder | DashboardBuilder | @/pages/dashboard/DashboardBuilder.jsx | oui | non |
| /fournisseurs | Fournisseurs | @/pages/fournisseurs/Fournisseurs.jsx | oui | non |
| /fournisseurs/nouveau | FournisseurCreate | @/pages/fournisseurs/FournisseurCreate.jsx | oui | non |
| /fournisseurs/:id | FournisseurDetailPage | @/pages/fournisseurs/FournisseurDetailPage.jsx | oui | non |
| /fournisseurs/:id/api | FournisseurApiSettingsForm | @/pages/fournisseurs/FournisseurApiSettingsForm.jsx | oui | non |
| /factures | Factures | @/pages/factures/Factures.jsx | oui | non |
| /factures/new | FactureForm | @/pages/factures/FactureForm.jsx | oui | non |
| /factures/:id | FactureForm | @/pages/factures/FactureForm.jsx | oui | non |
| /factures/import | ImportFactures | @/pages/factures/ImportFactures.jsx | oui | non |
| /receptions | Receptions | @/pages/receptions/Receptions.jsx | oui | non |
| /achats | Achats | @/pages/achats/Achats.jsx | oui | non |
| /bons-livraison | BonsLivraison | @/pages/bons_livraison/BonsLivraison.jsx | oui | non |
| /bons-livraison/nouveau | BLCreate | @/pages/bons_livraison/BLCreate.jsx | oui | non |
| /bons-livraison/:id | BLDetail | @/pages/bons_livraison/BLDetail.jsx | oui | non |
| /fiches | Fiches | @/pages/fiches/Fiches.jsx | oui | non |
| /fiches/:id | FicheDetail | @/pages/fiches/FicheDetail.jsx | oui | non |
| /menus | Menus | @/pages/menus/Menus.jsx | oui | non |
| /menu | MenuDuJourPlanning | @/pages/menu/MenuDuJour.jsx | oui | non |
| /menu/:date | MenuDuJourJour | @/pages/menu/MenuDuJourJour.jsx | oui | non |
| /menu-groupes | MenuGroupes | @/pages/menus/MenuGroupes.jsx | oui | non |
| /menu-groupes/nouveau | MenuGroupeForm | @/pages/menus/MenuGroupeForm.jsx | oui | non |
| /menu-groupes/:id | MenuGroupeDetail | @/pages/menus/MenuGroupeDetail.jsx | oui | non |
| /carte | Carte | @/pages/carte/Carte.jsx | oui | non |
| /recettes | Recettes | @/pages/recettes/Recettes.jsx | oui | non |
| /requisitions | Requisitions | @/pages/requisitions/Requisitions.jsx | oui | non |
| /requisitions/nouvelle | RequisitionForm | @/pages/requisitions/RequisitionForm.jsx | oui | non |
| /requisitions/:id | RequisitionDetail | @/pages/requisitions/RequisitionDetail.jsx | oui | non |
| /produits | Produits | @/pages/produits/Produits.jsx | oui | non |
| /produits/nouveau | ProduitForm | @/pages/produits/ProduitForm.jsx | oui | non |
| /produits/:id | ProduitDetail | @/pages/produits/ProduitDetail.jsx | oui | non |
| /inventaire | Inventaire | @/pages/inventaire/Inventaire.jsx | oui | non |
| /inventaire/zones | InventaireZones | @/pages/inventaire/InventaireZones.jsx | oui | non |
| /inventaire/new | InventaireForm | @/pages/inventaire/InventaireForm.jsx | oui | non |
| /inventaire/:id | InventaireDetail | @/pages/inventaire/InventaireDetail.jsx | oui | non |
| /transferts | StockTransferts | @/pages/stock/Transferts.jsx | oui | non |
| /stock/alertes | StockAlertesRupture | @/pages/stock/AlertesRupture.jsx | oui | non |
| /taches | Taches | @/pages/taches/Taches.jsx | oui | non |
| /taches/new | TacheForm | @/pages/taches/TacheForm.jsx | oui | non |
| /taches/:id | TacheDetail | @/pages/taches/TacheDetail.jsx | oui | non |
| /taches/alertes | AlertesTaches | @/pages/taches/Alertes.jsx | oui | non |
| /alertes | Alertes | @/pages/Alertes.jsx | oui | non |
| /promotions | Promotions | @/pages/promotions/Promotions.jsx | oui | non |
| /notifications | NotificationsInbox | @/pages/notifications/NotificationsInbox.jsx | oui | non |
| /notifications/settings | NotificationSettingsForm | @/pages/notifications/NotificationSettingsForm.jsx | oui | non |
| /documents | Documents | @/pages/documents/Documents.jsx | oui | non |
| /catalogue/sync | CatalogueSyncViewer | @/pages/catalogue/CatalogueSyncViewer.jsx | oui | non |
| /commandes | Commandes | @/pages/commandes/Commandes.jsx | oui | non |
| /commandes/envoyees | CommandesEnvoyees | @/pages/commandes/CommandesEnvoyees.jsx | oui | non |
| /commandes/nouvelle | CommandeForm | @/pages/commandes/CommandeForm.jsx | oui | non |
| /commandes/:id | CommandeDetail | @/pages/commandes/CommandeDetail.jsx | oui | non |
| /emails/envoyes | EmailsEnvoyes | @/pages/emails/EmailsEnvoyes.jsx | oui | non |
| /planning | Planning | @/pages/Planning.jsx | oui | non |
| /planning/nouveau | PlanningForm | @/pages/PlanningForm.jsx | oui | non |
| /planning/:id | PlanningDetail | @/pages/PlanningDetail.jsx | oui | non |
| /planning/simulation | SimulationPlanner | @/pages/planning/SimulationPlanner.jsx | oui | non |
| /analyse | Analyse | @/pages/analyse/Analyse.jsx | oui | non |
| /analyse/cost-centers | AnalyseCostCenter | @/pages/analyse/AnalyseCostCenter.jsx | oui | non |
| /costing/carte | CostingCarte | @/pages/costing/CostingCarte.jsx | oui | non |
| /analyse/analytique | AnalytiqueDashboard | @/pages/analytique/AnalytiqueDashboard.jsx | oui | non |
| /menu-engineering | MenuEngineering | @/pages/engineering/MenuEngineering.jsx | oui | non |
| /engineering | EngineeringMenu | @/pages/EngineeringMenu.jsx | oui | non |
| /tableaux-de-bord | TableauxDeBord | @/pages/analyse/TableauxDeBord.jsx | oui | non |
| /comparatif | Comparatif | @/pages/fournisseurs/comparatif/ComparatifPrix.jsx | oui | non |
| /surcouts | Surcouts | @/pages/surcouts/Surcouts.jsx | oui | non |
| /reporting | Reporting | @/pages/reporting/Reporting.jsx | oui | non |
| /consolidation | Consolidation | @/pages/consolidation/Consolidation.jsx | oui | non |
| /admin/access-multi-sites | AccessMultiSites | @/pages/consolidation/AccessMultiSites.jsx | oui | non |
| /parametrage/utilisateurs | Utilisateurs | @/pages/parametrage/Utilisateurs.jsx | oui | non |
| /parametrage/mamas | Mamas | @/pages/parametrage/Mamas.jsx | oui | non |
| /parametrage/permissions | Permissions | @/pages/parametrage/Permissions.jsx | oui | non |
| /parametrage/api-keys | APIKeys | @/pages/parametrage/APIKeys.jsx | oui | non |
| /parametrage/api-fournisseurs | ApiFournisseurs | @/pages/fournisseurs/ApiFournisseurs.jsx | oui | non |
| /parametrage/settings | MamaSettingsForm | @/pages/parametrage/MamaSettingsForm.jsx | oui | non |
| /parametrage/zones | Zones | @/pages/parametrage/Zones.jsx | oui | non |
| /parametrage/zones/:id | ZoneForm | @/pages/parametrage/ZoneForm.jsx | oui | non |
| /parametrage/zones/:id/droits | ZoneAccess | @/pages/parametrage/ZoneAccess.jsx | oui | non |
| /parametrage/familles | Familles | @/pages/parametrage/Familles.jsx | oui | non |
| /parametrage/sous-familles | SousFamilles | @/pages/parametrage/SousFamilles.jsx | oui | non |
| /parametrage/unites | Unites | @/pages/parametrage/Unites.jsx | oui | non |
| /parametrage/periodes | Periodes | @/pages/parametrage/Periodes.jsx | oui | non |
| /parametrage/system | SystemTools | @/pages/parametrage/SystemTools.jsx | oui | non |
| /parametrage/data | DataFolder | @/pages/parametrage/DataFolder.jsx | oui | non |
| /parametrage/access | AccessRights | @/pages/parametrage/AccessRights.jsx | oui | non |
| /consentements | Consentements | @/pages/Consentements.jsx | oui | non |
| /aide | AideContextuelle | @/pages/AideContextuelle.jsx | oui | non |
| /feedback | Feedback | @/pages/Feedback.jsx | oui | non |
| /stats | Stats | @/pages/stats/Stats.jsx | oui | non |
| /planning-module | PlanningModule | @/pages/PlanningModule.jsx | oui | non |
| /parametrage/roles | Roles | @/pages/parametrage/Roles.jsx | oui | non |
| /supervision | SupervisionGroupe | @/pages/supervision/SupervisionGroupe.jsx | oui | non |
| /supervision/comparateur | ComparateurFiches | @/pages/supervision/ComparateurFiches.jsx | oui | non |
| /supervision/logs | SupervisionLogs | @/pages/supervision/Logs.jsx | oui | non |
| /supervision/rapports | SupervisionRapports | @/pages/supervision/Rapports.jsx | oui | non |
| /debug/access | AccessExample |  | non | non |
| * | NotFound | @/pages/NotFound.jsx | oui | non |

## Hooks
- useHelp (src/context/HelpProvider.jsx)
- useMultiMama (src/context/MultiMamaContext.jsx)
- useTheme (src/context/ThemeProvider.jsx)
- useAuth (src/contexts/AuthContext.d.ts)
- useAccess (src/hooks/useAccess.js)
- useAchats (src/hooks/useAchats.js)
- useAdvancedStats (src/hooks/useAdvancedStats.js)
- useAide (src/hooks/useAide.js)
- useAlerteStockFaible (src/hooks/useAlerteStockFaible.js)
- useAlerts (src/hooks/useAlerts.js)
- useAnalyse (src/hooks/useAnalyse.js)
- useAnalytique (src/hooks/useAnalytique.js)
- useApiKeys (src/hooks/useApiKeys.js)
- useAuditLog (src/hooks/useAuditLog.js)
- useAuth (src/hooks/useAuth.ts)
- useBonsLivraison (src/hooks/useBonsLivraison.js)
- useCarte (src/hooks/useCarte.js)
- useCommandes (src/hooks/useCommandes.js)
- useComparatif (src/hooks/useComparatif.js)
- useConsentements (src/hooks/useConsentements.js)
- useConsolidatedStats (src/hooks/useConsolidatedStats.js)
- useConsolidation (src/hooks/useConsolidation.js)
- useCostCenterMonthlyStats (src/hooks/useCostCenterMonthlyStats.js)
- useCostCenterStats (src/hooks/useCostCenterStats.js)
- useCostCenterSuggestions (src/hooks/useCostCenterSuggestions.js)
- useCostCenters (src/hooks/useCostCenters.js)
- useCostingCarte (src/hooks/useCostingCarte.js)
- useDashboard (src/hooks/useDashboard.js)
- useDashboardStats (src/hooks/useDashboardStats.js)
- useDashboards (src/hooks/useDashboards.js)
- useDebounce (src/hooks/useDebounce.js)
- useDocuments (src/hooks/useDocuments.js)
- useEcartsInventaire (src/hooks/useEcartsInventaire.js)
- useEmailsEnvoyes (src/hooks/useEmailsEnvoyes.js)
- useEnrichedProducts (src/hooks/useEnrichedProducts.js)
- useExport (src/hooks/useExport.js)
- useExportCompta (src/hooks/useExportCompta.js)
- useFactureForm (src/hooks/useFactureForm.js)
- useFactures (src/hooks/useFactures.js)
- useFacturesAutocomplete (src/hooks/useFacturesAutocomplete.js)
- useFacturesList (src/hooks/useFacturesList.js)
- useFamilles (src/hooks/useFamilles.js)
- useFamillesWithSousFamilles (src/hooks/useFamillesWithSousFamilles.js)
- useFeedback (src/hooks/useFeedback.js)
- useFicheCoutHistory (src/hooks/useFicheCoutHistory.js)
- useFiches (src/hooks/useFiches.js)
- useFichesAutocomplete (src/hooks/useFichesAutocomplete.js)
- useFichesTechniques (src/hooks/useFichesTechniques.js)
- useFormErrors (src/hooks/useFormErrors.js)
- useFormatters (src/hooks/useFormatters.js)
- useFournisseurAPI (src/hooks/useFournisseurAPI.js)
- useFournisseurApiConfig (src/hooks/useFournisseurApiConfig.js)
- useFournisseurNotes (src/hooks/useFournisseurNotes.js)
- useFournisseurStats (src/hooks/useFournisseurStats.js)
- useFournisseurs (src/hooks/useFournisseurs.js)
- useFournisseursAutocomplete (src/hooks/useFournisseursAutocomplete.js)
- useFournisseursBrowse (src/hooks/useFournisseursBrowse.js)
- useFournisseursInactifs (src/hooks/useFournisseursInactifs.js)
- useFournisseursList (src/hooks/useFournisseursList.js)
- useFournisseursRecents (src/hooks/useFournisseursRecents.js)
- useGadgets (src/hooks/useGadgets.js)
- useGlobalSearch (src/hooks/useGlobalSearch.js)
- useGraphiquesMultiZone (src/hooks/useGraphiquesMultiZone.js)
- useHelpArticles (src/hooks/useHelpArticles.js)
- useInventaireLignes (src/hooks/useInventaireLignes.js)
- useInventaireZones (src/hooks/useInventaireZones.js)
- useInventaires (src/hooks/useInventaires.js)
- useInvoice (src/hooks/useInvoice.ts)
- useInvoiceImport (src/hooks/useInvoiceImport.js)
- useInvoiceItems (src/hooks/useInvoiceItems.js)
- useInvoiceOcr (src/hooks/useInvoiceOcr.js)
- useInvoices (src/hooks/useInvoices.js)
- useLogs (src/hooks/useLogs.js)
- useMama (src/hooks/useMama.js)
- useMamaSettings (src/hooks/useMamaSettings.js)
- useMamaSwitcher (src/hooks/useMamaSwitcher.js)
- useMamas (src/hooks/useMamas.js)
- useMenuDuJour (src/hooks/useMenuDuJour.js)
- useMenuEngineering (src/hooks/useMenuEngineering.js)
- useMenuGroupe (src/hooks/useMenuGroupe.js)
- useMenus (src/hooks/useMenus.js)
- useMouvementCostCenters (src/hooks/useMouvementCostCenters.js)
- useNotifications (src/hooks/useNotifications.js)
- useOnboarding (src/hooks/useOnboarding.js)
- usePerformanceFiches (src/hooks/usePerformanceFiches.js)
- usePeriodes (src/hooks/usePeriodes.js)
- usePermissions (src/hooks/usePermissions.js)
- usePertes (src/hooks/usePertes.js)
- usePlanning (src/hooks/usePlanning.js)
- usePriceTrends (src/hooks/usePriceTrends.js)
- useProducts (src/hooks/useProducts.js)
- useProduitLineDefaults (src/hooks/useProduitLineDefaults.js)
- useProduitsAutocomplete (src/hooks/useProduitsAutocomplete.js)
- useProduitsFournisseur (src/hooks/useProduitsFournisseur.js)
- useProduitsInventaire (src/hooks/useProduitsInventaire.js)
- useProduitsSearch (src/hooks/useProduitsSearch.js)
- usePromotions (src/hooks/usePromotions.js)
- useRGPD (src/hooks/useRGPD.js)
- useRecommendations (src/hooks/useRecommendations.js)
- useReporting (src/hooks/useReporting.js)
- useRequisitions (src/hooks/useRequisitions.js)
- useRoles (src/hooks/useRoles.js)
- useRuptureAlerts (src/hooks/useRuptureAlerts.js)
- useSignalements (src/hooks/useSignalements.js)
- useSignalement (src/hooks/useSignalements.js)
- useSousFamilles (src/hooks/useSousFamilles.js)
- useStats (src/hooks/useStats.js)
- useStock (src/hooks/useStock.js)
- useStockRequisitionne (src/hooks/useStockRequisitionne.js)
- useSwipe (src/hooks/useSwipe.js)
- useTacheAssignation (src/hooks/useTacheAssignation.js)
- useTaches (src/hooks/useTaches.js)
- useTasks (src/hooks/useTasks.js)
- useTemplatesCommandes (src/hooks/useTemplatesCommandes.js)
- useTopProducts (src/hooks/useTopProducts.js)
- useTransferts (src/hooks/useTransferts.js)
- useTwoFactorAuth (src/hooks/useTwoFactorAuth.js)
- useUnites (src/hooks/useUnites.js)
- useUsageStats (src/hooks/useUsageStats.js)
- useUtilisateurs (src/hooks/useUtilisateurs.js)
- useValidations (src/hooks/useValidations.js)
- useZoneProducts (src/hooks/useZoneProducts.js)
- useZoneRights (src/hooks/useZoneRights.js)
- useZones (src/hooks/useZones.js)
- useZonesStock (src/hooks/useZonesStock.js)
- useLockBodyScroll (src/components/ui/SmartDialog.jsx)
- useFactures (src/hooks/data/useFactures.js)
- useFournisseurs (src/hooks/data/useFournisseurs.js)
- useAchatsMensuels (src/hooks/gadgets/useAchatsMensuels.js)
- useAlerteStockFaible (src/hooks/gadgets/useAlerteStockFaible.js)
- useBudgetMensuel (src/hooks/gadgets/useBudgetMensuel.js)
- useConsoMoyenne (src/hooks/gadgets/useConsoMoyenne.js)
- useDerniersAcces (src/hooks/gadgets/useDerniersAcces.js)
- useEvolutionAchats (src/hooks/gadgets/useEvolutionAchats.js)
- useProduitsUtilises (src/hooks/gadgets/useProduitsUtilises.js)
- useTachesUrgentes (src/hooks/gadgets/useTachesUrgentes.js)
- useTopFournisseurs (src/hooks/gadgets/useTopFournisseurs.js)

## Contextes
- HelpContext (src/context/HelpProvider.jsx)
- MultiMamaContext (src/context/MultiMamaContext.jsx)
- ThemeContext (src/context/ThemeProvider.jsx)
- AuthCtx (src/contexts/AuthContext.jsx)

## Variables d'environnement
- DEV
- PROD
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_URL

## Contrats de données
- facture : id, fournisseur_id, total, date, numero, date_facture, fournisseur, total_ttc, statut, actif
- factures : map, date_facture
- roles : length, includes, map, some, find
- mamas : length, map, find, filter
- familles : length, map, forEach, includes, get, filter, xlsx, find
- produit : nom, famille_id, sous_famille_id, unite_id, fournisseur_id, zone_stock_id, stock_min, tva, actif, allergenes, id, stock_theorique, seuil_min, unite, unite_nom, pmp, zone_stock, toLowerCase
- produits : reduce, map, filter, concat, js, nom
- fournisseurs : nom, has, find, map, length
- famille : id, nom, actif, sous_familles
- commande : fournisseur_id, reference, date_livraison_prevue, lignes, fournisseur, id
- role : access_rights, id, nom, description, actif, mama_id
- utilisateurs : xlsx
- fournisseur : id, actif, nom, contact
- inventaire : lignes, id, reference, date_inventaire, cloture, document, csv, zone, toLocaleString
- mama : logo, id
- utilisateur : email, actif, nom, role, mamaNom, mama_id, id, historique, access_rights
- taches : filter, map, length
- commandes : map
- tache : utilisateurs_taches, titre, description, priorite, date_echeance, statut

## Erreurs potentielles
- [supabase] src/hooks/useAuditLog.js - Référence à supabase
- [supabase] src/hooks/useBonsLivraison.js - Référence à supabase
- [supabase] src/hooks/useConsolidation.js - Référence à supabase
- [supabase] src/hooks/useCostCenters.js - Référence à supabase
- [supabase] src/hooks/useDashboard.js - Référence à supabase
- [supabase] src/hooks/useFamilles.js - Référence à supabase
- [supabase] src/hooks/useFiches.js - Référence à supabase
- [supabase] src/hooks/useFournisseurAPI.js - Référence à supabase
- [supabase] src/hooks/useGlobalSearch.js - Référence à supabase
- [supabase] src/hooks/useInventaires.js - Référence à supabase
- [supabase] src/hooks/useMamas.js - Référence à supabase
- [supabase] src/hooks/useMenuDuJour.js - Référence à supabase
- [supabase] src/hooks/useMenuGroupe.js - Référence à supabase
- [supabase] src/hooks/useMenus.js - Référence à supabase
- [supabase] src/hooks/useNotifications.js - Référence à supabase
- [supabase] src/hooks/usePeriodes.js - Référence à supabase
- [supabase] src/hooks/usePermissions.js - Référence à supabase
- [supabase] src/hooks/usePlanning.js - Référence à supabase
- [supabase] src/hooks/useRGPD.js - Référence à supabase
- [supabase] src/hooks/useReporting.js - Référence à supabase
- [supabase] src/hooks/useRequisitions.js - Référence à supabase
- [supabase] src/hooks/useSousFamilles.js - Référence à supabase
- [supabase] src/hooks/useStats.js - Référence à supabase
- [supabase] src/hooks/useTacheAssignation.js - Référence à supabase
- [supabase] src/hooks/useTaches.js - Référence à supabase
- [supabase] src/hooks/useTwoFactorAuth.js - Référence à supabase
- [supabase] src/hooks/useUtilisateurs.js - Référence à supabase
- [supabase] src/utils/importExcelProduits.js - Référence à supabase
- [supabase] src/api/public/stock.js - Référence à supabase
- [supabase] src/pages/costboisson/CostBoisson.jsx - Référence à supabase
- [supabase] src/pages/parametrage/InviteUser.jsx - Référence à supabase
- [supabase] src/pages/parametrage/Mamas.jsx - Référence à supabase
- [supabase] src/pages/parametrage/PermissionsAdmin.jsx - Référence à supabase
- [supabase] src/pages/parametrage/PermissionsForm.jsx - Référence à supabase
- [supabase] src/pages/parametrage/RGPDConsentForm.jsx - Référence à supabase
- [supabase] src/pages/stats/StatsFiches.jsx - Référence à supabase
- [supabase] src/pages/supervision/GroupeParamForm.jsx - Référence à supabase
- [supabase] src/pages/supervision/Rapports.jsx - Référence à supabase

## TODOs
- src/hooks/useInvoiceOcr.js - TODO: brancher un vrai moteur OCR plus tard
- src/api/public/promotions.js - TODO: adapter si la table diffère
- src/components/inventaires/InventaireForm.jsx - TODO: recompute mouvements via requisitions
- src/components/parametrage/SousFamilleList.jsx - TODO: implémentation réelle (filtre par mama_id, pagination)
- src/pages/signalements/Signalements.jsx - TODO: brancher aux vues SQL correspondantes + RLS
- src/pages/simulation/SimulationForm.jsx - TODO: implémentation réelle (entrées, calculs)
