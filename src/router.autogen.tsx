import React from "react";

export type RouteItem = {
  path: string;
  label?: string;
  group?: string;
  importPath: string;
};

export const autoRoutes: RouteItem[] = [
  {
    "path": "/accueil",
    "label": "Accueil",
    "importPath": "/src/pages/Accueil.jsx"
  },
  {
    "path": "/aidecontextuelle",
    "label": "AideContextuelle",
    "importPath": "/src/pages/AideContextuelle.jsx"
  },
  {
    "path": "/alertes",
    "label": "Alertes",
    "importPath": "/src/pages/Alertes.jsx"
  },
  {
    "path": "/barmanager",
    "label": "BarManager",
    "importPath": "/src/pages/BarManager.jsx"
  },
  {
    "path": "/carteplats",
    "label": "CartePlats",
    "importPath": "/src/pages/CartePlats.jsx"
  },
  {
    "path": "/consentements",
    "label": "Consentements",
    "importPath": "/src/pages/Consentements.jsx"
  },
  {
    "path": "/",
    "label": "Dashboard",
    "importPath": "/src/pages/Dashboard.jsx"
  },
  {
    "path": "/dossierdonnees",
    "label": "DossierDonnees",
    "importPath": "/src/pages/DossierDonnees.jsx"
  },
  {
    "path": "/engineeringmenu",
    "label": "EngineeringMenu",
    "importPath": "/src/pages/EngineeringMenu.jsx"
  },
  {
    "path": "/feedback",
    "label": "Feedback",
    "importPath": "/src/pages/Feedback.jsx"
  },
  {
    "path": "/helpcenter",
    "label": "HelpCenter",
    "importPath": "/src/pages/HelpCenter.jsx"
  },
  {
    "path": "/journal",
    "label": "Journal",
    "importPath": "/src/pages/Journal.jsx"
  },
  {
    "path": "/login",
    "label": "Login",
    "importPath": "/src/pages/Login.jsx"
  },
  {
    "path": "/notfound",
    "label": "NotFound",
    "importPath": "/src/pages/NotFound.jsx"
  },
  {
    "path": "/parametres/familles",
    "label": "Familles",
    "importPath": "/src/pages/Parametres/Familles.jsx"
  },
  {
    "path": "/pertes",
    "label": "Pertes",
    "importPath": "/src/pages/Pertes.jsx"
  },
  {
    "path": "/planning",
    "label": "Planning",
    "importPath": "/src/pages/Planning.jsx"
  },
  {
    "path": "/planningdetail",
    "label": "PlanningDetail",
    "importPath": "/src/pages/PlanningDetail.jsx"
  },
  {
    "path": "/planningform",
    "label": "PlanningForm",
    "importPath": "/src/pages/PlanningForm.jsx"
  },
  {
    "path": "/planningmodule",
    "label": "PlanningModule",
    "importPath": "/src/pages/PlanningModule.jsx"
  },
  {
    "path": "/rgpd",
    "label": "Rgpd",
    "importPath": "/src/pages/Rgpd.jsx"
  },
  {
    "path": "/stock",
    "label": "Stock",
    "importPath": "/src/pages/Stock.jsx"
  },
  {
    "path": "/utilisateurs",
    "label": "Utilisateurs",
    "importPath": "/src/pages/Utilisateurs.jsx"
  },
  {
    "path": "/validations",
    "label": "Validations",
    "importPath": "/src/pages/Validations.jsx"
  },
  {
    "path": "/achats/achatdetail",
    "label": "AchatDetail",
    "importPath": "/src/pages/achats/AchatDetail.jsx"
  },
  {
    "path": "/achats/achatform",
    "label": "AchatForm",
    "importPath": "/src/pages/achats/AchatForm.jsx"
  },
  {
    "path": "/achats/achats",
    "label": "Achats",
    "importPath": "/src/pages/achats/Achats.jsx"
  },
  {
    "path": "/aide/aide",
    "label": "Aide",
    "importPath": "/src/pages/aide/Aide.jsx"
  },
  {
    "path": "/aide/aideform",
    "label": "AideForm",
    "importPath": "/src/pages/aide/AideForm.jsx"
  },
  {
    "path": "/analyse/analyse",
    "label": "Analyse",
    "importPath": "/src/pages/analyse/Analyse.jsx"
  },
  {
    "path": "/analyse/analysecostcenter",
    "label": "AnalyseCostCenter",
    "importPath": "/src/pages/analyse/AnalyseCostCenter.jsx"
  },
  {
    "path": "/analyse/menuengineering",
    "label": "MenuEngineering",
    "importPath": "/src/pages/analyse/MenuEngineering.jsx"
  },
  {
    "path": "/analyse/tableauxdebord",
    "label": "TableauxDeBord",
    "importPath": "/src/pages/analyse/TableauxDeBord.jsx"
  },
  {
    "path": "/analytique/analytiquedashboard",
    "label": "AnalytiqueDashboard",
    "importPath": "/src/pages/analytique/AnalytiqueDashboard.jsx"
  },
  {
    "path": "/auth/blocked",
    "label": "Blocked",
    "importPath": "/src/pages/auth/Blocked.jsx"
  },
  {
    "path": "/auth/createmama",
    "label": "CreateMama",
    "importPath": "/src/pages/auth/CreateMama.jsx"
  },
  {
    "path": "/auth/logout",
    "label": "Logout",
    "importPath": "/src/pages/auth/Logout.jsx"
  },
  {
    "path": "/auth/pending",
    "label": "Pending",
    "importPath": "/src/pages/auth/Pending.jsx"
  },
  {
    "path": "/auth/resetpassword",
    "label": "ResetPassword",
    "importPath": "/src/pages/auth/ResetPassword.jsx"
  },
  {
    "path": "/auth/roleerror",
    "label": "RoleError",
    "importPath": "/src/pages/auth/RoleError.jsx"
  },
  {
    "path": "/auth/unauthorized",
    "label": "Unauthorized",
    "importPath": "/src/pages/auth/Unauthorized.jsx"
  },
  {
    "path": "/auth/updatepassword",
    "label": "UpdatePassword",
    "importPath": "/src/pages/auth/UpdatePassword.jsx"
  },
  {
    "path": "/bons_livraison/blcreate",
    "label": "BLCreate",
    "importPath": "/src/pages/bons_livraison/BLCreate.jsx"
  },
  {
    "path": "/bons_livraison/bldetail",
    "label": "BLDetail",
    "importPath": "/src/pages/bons_livraison/BLDetail.jsx"
  },
  {
    "path": "/bons_livraison/blform",
    "label": "BLForm",
    "importPath": "/src/pages/bons_livraison/BLForm.jsx"
  },
  {
    "path": "/bons_livraison/bonslivraison",
    "label": "BonsLivraison",
    "importPath": "/src/pages/bons_livraison/BonsLivraison.jsx"
  },
  {
    "path": "/carte/carte",
    "label": "Carte",
    "importPath": "/src/pages/carte/Carte.jsx"
  },
  {
    "path": "/catalogue/cataloguesyncviewer",
    "label": "CatalogueSyncViewer",
    "importPath": "/src/pages/catalogue/CatalogueSyncViewer.jsx"
  },
  {
    "path": "/commandes/commandedetail",
    "label": "CommandeDetail",
    "importPath": "/src/pages/commandes/CommandeDetail.jsx"
  },
  {
    "path": "/commandes/commandeform",
    "label": "CommandeForm",
    "importPath": "/src/pages/commandes/CommandeForm.jsx"
  },
  {
    "path": "/commandes/commandes",
    "label": "Commandes",
    "importPath": "/src/pages/commandes/Commandes.jsx"
  },
  {
    "path": "/commandes/commandesenvoyees",
    "label": "CommandesEnvoyees",
    "importPath": "/src/pages/commandes/CommandesEnvoyees.jsx"
  },
  {
    "path": "/consolidation/accessmultisites",
    "label": "AccessMultiSites",
    "importPath": "/src/pages/consolidation/AccessMultiSites.jsx"
  },
  {
    "path": "/consolidation/consolidation",
    "label": "Consolidation",
    "importPath": "/src/pages/consolidation/Consolidation.jsx"
  },
  {
    "path": "/costboisson/costboisson",
    "label": "CostBoisson",
    "importPath": "/src/pages/costboisson/CostBoisson.jsx"
  },
  {
    "path": "/costing/costingcarte",
    "label": "CostingCarte",
    "importPath": "/src/pages/costing/CostingCarte.jsx"
  },
  {
    "path": "/cuisine/menudujour",
    "label": "MenuDuJour",
    "importPath": "/src/pages/cuisine/MenuDuJour.jsx"
  },
  {
    "path": "/",
    "label": "DashboardBuilder",
    "importPath": "/src/pages/dashboard/DashboardBuilder.jsx"
  },
  {
    "path": "/debug/accessexample",
    "label": "AccessExample",
    "importPath": "/src/pages/debug/AccessExample.jsx"
  },
  {
    "path": "/debug/auth",
    "label": "Auth",
    "importPath": "/src/pages/debug/Auth.tsx"
  },
  {
    "path": "/debug/authdebug",
    "label": "AuthDebug",
    "importPath": "/src/pages/debug/AuthDebug.jsx"
  },
  {
    "path": "/debug/debug",
    "label": "Debug",
    "importPath": "/src/pages/debug/Debug.jsx"
  },
  {
    "path": "/debug/debugauth",
    "label": "DebugAuth",
    "importPath": "/src/pages/debug/DebugAuth.jsx"
  },
  {
    "path": "/debug/debugrights",
    "label": "DebugRights",
    "importPath": "/src/pages/debug/DebugRights.jsx"
  },
  {
    "path": "/debug/debuguser",
    "label": "DebugUser",
    "importPath": "/src/pages/debug/DebugUser.jsx"
  },
  {
    "path": "/documents/documentform",
    "label": "DocumentForm",
    "importPath": "/src/pages/documents/DocumentForm.jsx"
  },
  {
    "path": "/documents/documents",
    "label": "Documents",
    "importPath": "/src/pages/documents/Documents.jsx"
  },
  {
    "path": "/ecarts/ecarts",
    "label": "Ecarts",
    "importPath": "/src/pages/ecarts/Ecarts.jsx"
  },
  {
    "path": "/emails/emailsenvoyes",
    "label": "EmailsEnvoyes",
    "importPath": "/src/pages/emails/EmailsEnvoyes.jsx"
  },
  {
    "path": "/engineering/menuengineering",
    "label": "MenuEngineering",
    "importPath": "/src/pages/engineering/MenuEngineering.jsx"
  },
  {
    "path": "/factures/facturecreate",
    "label": "FactureCreate",
    "importPath": "/src/pages/factures/FactureCreate.jsx"
  },
  {
    "path": "/factures/facturedetail",
    "label": "FactureDetail",
    "importPath": "/src/pages/factures/FactureDetail.jsx"
  },
  {
    "path": "/factures/factureform",
    "label": "FactureForm",
    "importPath": "/src/pages/factures/FactureForm.jsx"
  },
  {
    "path": "/factures/factures",
    "label": "Factures",
    "importPath": "/src/pages/factures/Factures.jsx"
  },
  {
    "path": "/factures/importfactures",
    "label": "ImportFactures",
    "importPath": "/src/pages/factures/ImportFactures.jsx"
  },
  {
    "path": "/fiches/fichedetail",
    "label": "FicheDetail",
    "importPath": "/src/pages/fiches/FicheDetail.jsx"
  },
  {
    "path": "/fiches/ficheform",
    "label": "FicheForm",
    "importPath": "/src/pages/fiches/FicheForm.jsx"
  },
  {
    "path": "/fiches/fiches",
    "label": "Fiches",
    "importPath": "/src/pages/fiches/Fiches.jsx"
  },
  {
    "path": "/fournisseurs/apifournisseurform",
    "label": "ApiFournisseurForm",
    "importPath": "/src/pages/fournisseurs/ApiFournisseurForm.jsx"
  },
  {
    "path": "/fournisseurs/apifournisseurs",
    "label": "ApiFournisseurs",
    "importPath": "/src/pages/fournisseurs/ApiFournisseurs.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurapisettingsform",
    "label": "FournisseurApiSettingsForm",
    "importPath": "/src/pages/fournisseurs/FournisseurApiSettingsForm.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurcreate",
    "label": "FournisseurCreate",
    "importPath": "/src/pages/fournisseurs/FournisseurCreate.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurdetail",
    "label": "FournisseurDetail",
    "importPath": "/src/pages/fournisseurs/FournisseurDetail.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurdetailpage",
    "label": "FournisseurDetailPage",
    "importPath": "/src/pages/fournisseurs/FournisseurDetailPage.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurform",
    "label": "FournisseurForm",
    "importPath": "/src/pages/fournisseurs/FournisseurForm.jsx"
  },
  {
    "path": "/fournisseurs/fournisseurs",
    "label": "Fournisseurs",
    "importPath": "/src/pages/fournisseurs/Fournisseurs.jsx"
  },
  {
    "path": "/fournisseurs/comparatif/comparatifprix",
    "label": "ComparatifPrix",
    "importPath": "/src/pages/fournisseurs/comparatif/ComparatifPrix.jsx"
  },
  {
    "path": "/fournisseurs/comparatif/prixfournisseurs",
    "label": "PrixFournisseurs",
    "importPath": "/src/pages/fournisseurs/comparatif/PrixFournisseurs.jsx"
  },
  {
    "path": "/inventaire/ecartinventaire",
    "label": "EcartInventaire",
    "importPath": "/src/pages/inventaire/EcartInventaire.jsx"
  },
  {
    "path": "/inventaire/inventaire",
    "label": "Inventaire",
    "importPath": "/src/pages/inventaire/Inventaire.jsx"
  },
  {
    "path": "/inventaire/inventairedetail",
    "label": "InventaireDetail",
    "importPath": "/src/pages/inventaire/InventaireDetail.jsx"
  },
  {
    "path": "/inventaire/inventaireform",
    "label": "InventaireForm",
    "importPath": "/src/pages/inventaire/InventaireForm.jsx"
  },
  {
    "path": "/inventaire/inventairezones",
    "label": "InventaireZones",
    "importPath": "/src/pages/inventaire/InventaireZones.jsx"
  },
  {
    "path": "/legal/cgu",
    "label": "Cgu",
    "importPath": "/src/pages/legal/Cgu.jsx"
  },
  {
    "path": "/legal/cgv",
    "label": "Cgv",
    "importPath": "/src/pages/legal/Cgv.jsx"
  },
  {
    "path": "/legal/confidentialite",
    "label": "Confidentialite",
    "importPath": "/src/pages/legal/Confidentialite.jsx"
  },
  {
    "path": "/legal/contact",
    "label": "Contact",
    "importPath": "/src/pages/legal/Contact.jsx"
  },
  {
    "path": "/legal/licence",
    "label": "Licence",
    "importPath": "/src/pages/legal/Licence.jsx"
  },
  {
    "path": "/legal/mentionslegales",
    "label": "MentionsLegales",
    "importPath": "/src/pages/legal/MentionsLegales.jsx"
  },
  {
    "path": "/menu/menudujour",
    "label": "MenuDuJour",
    "importPath": "/src/pages/menu/MenuDuJour.jsx"
  },
  {
    "path": "/menu/menudujourjour",
    "label": "MenuDuJourJour",
    "importPath": "/src/pages/menu/MenuDuJourJour.jsx"
  },
  {
    "path": "/menus/menudetail",
    "label": "MenuDetail",
    "importPath": "/src/pages/menus/MenuDetail.jsx"
  },
  {
    "path": "/menus/menudujour",
    "label": "MenuDuJour",
    "importPath": "/src/pages/menus/MenuDuJour.jsx"
  },
  {
    "path": "/menus/menudujourdetail",
    "label": "MenuDuJourDetail",
    "importPath": "/src/pages/menus/MenuDuJourDetail.jsx"
  },
  {
    "path": "/menus/menudujourform",
    "label": "MenuDuJourForm",
    "importPath": "/src/pages/menus/MenuDuJourForm.jsx"
  },
  {
    "path": "/menus/menuform",
    "label": "MenuForm",
    "importPath": "/src/pages/menus/MenuForm.jsx"
  },
  {
    "path": "/menus/menugroupedetail",
    "label": "MenuGroupeDetail",
    "importPath": "/src/pages/menus/MenuGroupeDetail.jsx"
  },
  {
    "path": "/menus/menugroupeform",
    "label": "MenuGroupeForm",
    "importPath": "/src/pages/menus/MenuGroupeForm.jsx"
  },
  {
    "path": "/menus/menugroupes",
    "label": "MenuGroupes",
    "importPath": "/src/pages/menus/MenuGroupes.jsx"
  },
  {
    "path": "/menus/menupdf",
    "label": "MenuPDF",
    "importPath": "/src/pages/menus/MenuPDF.jsx"
  },
  {
    "path": "/menus/menus",
    "label": "Menus",
    "importPath": "/src/pages/menus/Menus.jsx"
  },
  {
    "path": "/mobile/mobileaccueil",
    "label": "MobileAccueil",
    "importPath": "/src/pages/mobile/MobileAccueil.jsx"
  },
  {
    "path": "/mobile/mobileinventaire",
    "label": "MobileInventaire",
    "importPath": "/src/pages/mobile/MobileInventaire.jsx"
  },
  {
    "path": "/mobile/mobilerequisition",
    "label": "MobileRequisition",
    "importPath": "/src/pages/mobile/MobileRequisition.jsx"
  },
  {
    "path": "/notifications/notificationsettingsform",
    "label": "NotificationSettingsForm",
    "importPath": "/src/pages/notifications/NotificationSettingsForm.jsx"
  },
  {
    "path": "/notifications/notificationsinbox",
    "label": "NotificationsInbox",
    "importPath": "/src/pages/notifications/NotificationsInbox.jsx"
  },
  {
    "path": "/parametrage/apikeys",
    "label": "APIKeys",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/APIKeys.jsx"
  },
  {
    "path": "/parametrage/accessrights",
    "label": "AccessRights",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/AccessRights.jsx"
  },
  {
    "path": "/parametrage/centrecoutform",
    "label": "CentreCoutForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/CentreCoutForm.jsx"
  },
  {
    "path": "/parametrage/dossierdonnees",
    "label": "DossierDonnees",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/DossierDonnees.tsx"
  },
  {
    "path": "/parametrage/exportcomptapage",
    "label": "ExportComptaPage",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/ExportComptaPage.jsx"
  },
  {
    "path": "/parametrage/exportuserdata",
    "label": "ExportUserData",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/ExportUserData.jsx"
  },
  {
    "path": "/parametrage/familles",
    "label": "Familles",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Familles.jsx"
  },
  {
    "path": "/parametrage/familles",
    "label": "Familles",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Familles.tsx"
  },
  {
    "path": "/parametrage/invitationsenattente",
    "label": "InvitationsEnAttente",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/InvitationsEnAttente.jsx"
  },
  {
    "path": "/parametrage/inviteuser",
    "label": "InviteUser",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/InviteUser.jsx"
  },
  {
    "path": "/parametrage/mamaform",
    "label": "MamaForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/MamaForm.jsx"
  },
  {
    "path": "/parametrage/mamasettingsform",
    "label": "MamaSettingsForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/MamaSettingsForm.jsx"
  },
  {
    "path": "/parametrage/mamas",
    "label": "Mamas",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Mamas.jsx"
  },
  {
    "path": "/parametrage/parametrage",
    "label": "Parametrage",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Parametrage.jsx"
  },
  {
    "path": "/parametrage/parametrescommandes",
    "label": "ParametresCommandes",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/ParametresCommandes.jsx"
  },
  {
    "path": "/parametrage/periodes",
    "label": "Periodes",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Periodes.jsx"
  },
  {
    "path": "/parametrage/permissions",
    "label": "Permissions",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Permissions.jsx"
  },
  {
    "path": "/parametrage/permissionsadmin",
    "label": "PermissionsAdmin",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/PermissionsAdmin.jsx"
  },
  {
    "path": "/parametrage/permissionsform",
    "label": "PermissionsForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/PermissionsForm.jsx"
  },
  {
    "path": "/parametrage/rgpdconsentform",
    "label": "RGPDConsentForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/RGPDConsentForm.jsx"
  },
  {
    "path": "/parametrage/roleform",
    "label": "RoleForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/RoleForm.jsx"
  },
  {
    "path": "/parametrage/roles",
    "label": "Roles",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Roles.jsx"
  },
  {
    "path": "/parametrage/sousfamilles",
    "label": "SousFamilles",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/SousFamilles.jsx"
  },
  {
    "path": "/parametrage/sousfamilles",
    "label": "SousFamilles",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/SousFamilles.tsx"
  },
  {
    "path": "/parametrage/systemtools",
    "label": "SystemTools",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/SystemTools.jsx"
  },
  {
    "path": "/parametrage/templatecommandeform",
    "label": "TemplateCommandeForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/TemplateCommandeForm.jsx"
  },
  {
    "path": "/parametrage/templatescommandes",
    "label": "TemplatesCommandes",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/TemplatesCommandes.jsx"
  },
  {
    "path": "/parametrage/unites",
    "label": "Unites",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Unites.jsx"
  },
  {
    "path": "/parametrage/unites",
    "label": "Unites",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Unites.tsx"
  },
  {
    "path": "/parametrage/utilisateurs",
    "label": "Utilisateurs",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Utilisateurs.jsx"
  },
  {
    "path": "/parametrage/zoneaccess",
    "label": "ZoneAccess",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/ZoneAccess.jsx"
  },
  {
    "path": "/parametrage/zoneform",
    "label": "ZoneForm",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/ZoneForm.jsx"
  },
  {
    "path": "/parametrage/zones",
    "label": "Zones",
    "group": "Paramétrage",
    "importPath": "/src/pages/parametrage/Zones.jsx"
  },
  {
    "path": "/planning/simulationplanner",
    "label": "SimulationPlanner",
    "importPath": "/src/pages/planning/SimulationPlanner.jsx"
  },
  {
    "path": "/produits/produitdetail",
    "label": "ProduitDetail",
    "importPath": "/src/pages/produits/ProduitDetail.jsx"
  },
  {
    "path": "/produits/produitform",
    "label": "ProduitForm",
    "importPath": "/src/pages/produits/ProduitForm.jsx"
  },
  {
    "path": "/produits/produits",
    "label": "Produits",
    "importPath": "/src/pages/produits/Produits.jsx"
  },
  {
    "path": "/promotions/promotionform",
    "label": "PromotionForm",
    "importPath": "/src/pages/promotions/PromotionForm.jsx"
  },
  {
    "path": "/promotions/promotions",
    "label": "Promotions",
    "importPath": "/src/pages/promotions/Promotions.jsx"
  },
  {
    "path": "/public/landingpage",
    "label": "LandingPage",
    "importPath": "/src/pages/public/LandingPage.jsx"
  },
  {
    "path": "/public/signup",
    "label": "Signup",
    "importPath": "/src/pages/public/Signup.jsx"
  },
  {
    "path": "/receptions/receptions",
    "label": "Receptions",
    "importPath": "/src/pages/receptions/Receptions.jsx"
  },
  {
    "path": "/recettes/recettes",
    "label": "Recettes",
    "importPath": "/src/pages/recettes/Recettes.jsx"
  },
  {
    "path": "/reporting/graphcost",
    "label": "GraphCost",
    "importPath": "/src/pages/reporting/GraphCost.jsx"
  },
  {
    "path": "/reporting/reporting",
    "label": "Reporting",
    "importPath": "/src/pages/reporting/Reporting.jsx"
  },
  {
    "path": "/reporting/reportingpdf",
    "label": "ReportingPDF",
    "importPath": "/src/pages/reporting/ReportingPDF.jsx"
  },
  {
    "path": "/requisitions/requisitiondetail",
    "label": "RequisitionDetail",
    "importPath": "/src/pages/requisitions/RequisitionDetail.jsx"
  },
  {
    "path": "/requisitions/requisitionform",
    "label": "RequisitionForm",
    "importPath": "/src/pages/requisitions/RequisitionForm.jsx"
  },
  {
    "path": "/requisitions/requisitions",
    "label": "Requisitions",
    "importPath": "/src/pages/requisitions/Requisitions.jsx"
  },
  {
    "path": "/signalements/signalementdetail",
    "label": "SignalementDetail",
    "importPath": "/src/pages/signalements/SignalementDetail.jsx"
  },
  {
    "path": "/signalements/signalementform",
    "label": "SignalementForm",
    "importPath": "/src/pages/signalements/SignalementForm.jsx"
  },
  {
    "path": "/signalements/signalements",
    "label": "Signalements",
    "importPath": "/src/pages/signalements/Signalements.jsx"
  },
  {
    "path": "/simulation/simulation",
    "label": "Simulation",
    "importPath": "/src/pages/simulation/Simulation.jsx"
  },
  {
    "path": "/simulation/simulationform",
    "label": "SimulationForm",
    "importPath": "/src/pages/simulation/SimulationForm.jsx"
  },
  {
    "path": "/simulation/simulationmenu",
    "label": "SimulationMenu",
    "importPath": "/src/pages/simulation/SimulationMenu.jsx"
  },
  {
    "path": "/simulation/simulationresult",
    "label": "SimulationResult",
    "importPath": "/src/pages/simulation/SimulationResult.jsx"
  },
  {
    "path": "/stats/stats",
    "label": "Stats",
    "importPath": "/src/pages/stats/Stats.jsx"
  },
  {
    "path": "/stats/statsadvanced",
    "label": "StatsAdvanced",
    "importPath": "/src/pages/stats/StatsAdvanced.jsx"
  },
  {
    "path": "/stats/statsconsolidation",
    "label": "StatsConsolidation",
    "importPath": "/src/pages/stats/StatsConsolidation.jsx"
  },
  {
    "path": "/stats/statscostcenters",
    "label": "StatsCostCenters",
    "importPath": "/src/pages/stats/StatsCostCenters.jsx"
  },
  {
    "path": "/stats/statscostcenterspivot",
    "label": "StatsCostCentersPivot",
    "importPath": "/src/pages/stats/StatsCostCentersPivot.jsx"
  },
  {
    "path": "/stats/statsfiches",
    "label": "StatsFiches",
    "importPath": "/src/pages/stats/StatsFiches.jsx"
  },
  {
    "path": "/stats/statsstock",
    "label": "StatsStock",
    "importPath": "/src/pages/stats/StatsStock.jsx"
  },
  {
    "path": "/stock/alertesrupture",
    "label": "AlertesRupture",
    "importPath": "/src/pages/stock/AlertesRupture.jsx"
  },
  {
    "path": "/stock/inventaire",
    "label": "Inventaire",
    "importPath": "/src/pages/stock/Inventaire.jsx"
  },
  {
    "path": "/stock/inventaireform",
    "label": "InventaireForm",
    "importPath": "/src/pages/stock/InventaireForm.jsx"
  },
  {
    "path": "/stock/requisitions",
    "label": "Requisitions",
    "importPath": "/src/pages/stock/Requisitions.jsx"
  },
  {
    "path": "/stock/transfertform",
    "label": "TransfertForm",
    "importPath": "/src/pages/stock/TransfertForm.jsx"
  },
  {
    "path": "/stock/transferts",
    "label": "Transferts",
    "importPath": "/src/pages/stock/Transferts.jsx"
  },
  {
    "path": "/supervision/comparateurfiches",
    "label": "ComparateurFiches",
    "importPath": "/src/pages/supervision/ComparateurFiches.jsx"
  },
  {
    "path": "/supervision/groupeparamform",
    "label": "GroupeParamForm",
    "importPath": "/src/pages/supervision/GroupeParamForm.jsx"
  },
  {
    "path": "/supervision/logs",
    "label": "Logs",
    "importPath": "/src/pages/supervision/Logs.jsx"
  },
  {
    "path": "/supervision/rapports",
    "label": "Rapports",
    "importPath": "/src/pages/supervision/Rapports.jsx"
  },
  {
    "path": "/supervision/supervisiongroupe",
    "label": "SupervisionGroupe",
    "importPath": "/src/pages/supervision/SupervisionGroupe.jsx"
  },
  {
    "path": "/surcouts/surcouts",
    "label": "Surcouts",
    "importPath": "/src/pages/surcouts/Surcouts.jsx"
  },
  {
    "path": "/taches/alertes",
    "label": "Alertes",
    "importPath": "/src/pages/taches/Alertes.jsx"
  },
  {
    "path": "/taches/tachedetail",
    "label": "TacheDetail",
    "importPath": "/src/pages/taches/TacheDetail.jsx"
  },
  {
    "path": "/taches/tacheform",
    "label": "TacheForm",
    "importPath": "/src/pages/taches/TacheForm.jsx"
  },
  {
    "path": "/taches/tachenew",
    "label": "TacheNew",
    "importPath": "/src/pages/taches/TacheNew.jsx"
  },
  {
    "path": "/taches/taches",
    "label": "Taches",
    "importPath": "/src/pages/taches/Taches.jsx"
  }
];

export function buildAutoElements() {
  const routes = autoRoutes.map(r => {
    const Page = React.lazy(() => import(/* @vite-ignore */ r.importPath));
    return { path: r.path, element: <React.Suspense fallback={null}><Page /></React.Suspense> };
  });
  routes.push({ path: "*", element: <div style={{padding:16}}>Page introuvable</div> });
  return routes;
}
