# Diagnostic des modules – MAMASTOCK-LOCAL

_Généré le 2025-09-20T13:22:26Z_.

Les alias de résolution actifs :
- `@/*` → `src/*`
- `#db/*` → `db/*`

## 1. Synthèse par domaine

| Domaine | Modules & exports | Dépendances internes | Dépendances externes | Observations clés |
| --- | --- | --- | --- | --- |
| Entrée / shell | `main.jsx` (aucun export) ; `App.jsx` (export défaut `App`) ; `AppShell.tsx` (export défaut) ; `ScrollRestoration.jsx` (export défaut) ; `PrivateOutlet.jsx` / `ProtectedRoute.jsx` (exports défaut) | `@/router`, `@/hooks/useAuth`, `@/auth/redirect`, `@/components/ui/Spinner`, `@/services/analytics`, `@/Sidebar` | `react`, `react-dom`, `react-router-dom` | Initialisation React + HashRouter, écoute navigation analytics, redirection login ; import side-effect analytics inutilisé ; badges debug dans AppShell |
| App root | `Sidebar.tsx` (export défaut + `resolveSidebarState`) ; `AppShell.tsx` ; `Sidebar` dépend de `@/config/sidebar` | `@/config/sidebar` | `react-router-dom` | Sidebar rend la config statique, pas de logique d’accès, pas d’état de chargement |
| Router | `router.tsx` (export `appRouter` + défaut) ; `router.autogen.tsx` (auto, export `routes`) ; `routerPrefetch.ts` (exports `registerRoutePrefetch`, `prefetchRoute`) | `@/App`, `@/auth/RequireAuth`, `@/layout/*`, `@/router.autogen`, `@/routerPrefetch` | `react`, `react-router-dom` | Lazy routes pour login/setup/légal ; filtrage d’auto-routes ; duplications dans autogen (ex: `/parametrage/dossierdonnees`) |
| Layouts | `AppLayout.jsx`, `AdminLayout.jsx`, `Layout.jsx`, `LegalLayout.jsx`, `ViewerLayout.jsx`, `Navbar.jsx`, `Footer` (dans components) | `@/components/sidebar.autogen`, `@/components/LiquidBackground`, `@/components/ui/Spinner`, `@/layout/Navbar` | `react-router-dom`, `react-helmet-async`, `lucide-react` | Multiples layouts visuels ; Navbar contient actions logout/quit, stockage thème localStorage ; commentaires de licence ; indentation incohérente |
| Auth & session | `context/AuthContext.tsx` (`AuthProvider`, `useAuth`) ; `hooks/useAuth.ts` (`useAuth`, re-export `AuthProvider`) ; `auth/*` (`RequireAuth`, `AccessGate`, `authAdapter`, `localAccount`, `redirect`, `sqlAuth`, `sqlAccount`, `sqliteAuth`) ; `lib/auth/sessionStore.ts`, `sessionState.ts` | `@/appFs`, `@/constants/roles`, `@/lib/access`, `@/lib/auth/sessionState`, `@/hooks/useAuth`, `@/db/index`, `@/lib/db/database`, `@/lib/paths` | `@tauri-apps/*` (fs, path), `crypto` API, `react-router-dom` | Session persistée via `sessionStorage` (fallback mémoire) ; redirections login stockées via `sessionStore` ; modules SQL locaux pour Tauri ; plusieurs imports inutilisés (`isTauri`) |
| Services | `services/analytics.ts` (`trackEvent`, `trackPageView`, `addNavigationAnalyticsListener`, hook) ; `services/inventory.ts` (CRUD items + `sumStockForItems`) | `@/routerPrefetch`, `@/db/index` | `react` (hooks), Web Crypto | Analytics basé sur évènements `window`; inventaire repose sur DB SQLite |
| Base de données | `db/index.ts`, `client.ts`, `connection.ts`, `migrate.ts`, `migrationsList.ts`; `lib/db/database.ts`; `local/db.ts` | `@/lib/db/database`, `@/lib/paths`, `@/lib/tauriEnv`, `@/migrations/*.sql` | `@tauri-apps/plugin-sql`, `@tauri-apps/api/core`, `@tauri-apps/api/path` | Driver SQLite via Tauri, stub mémoire en dev ; migrations JSON locales ; import `isTauri` souvent inutilisé ; `sumStockForItems` typage erroné |
| Utils | `utils` (export/import Excel, number formatting, permissions, watermark…) ; `forms/formIds.js` ; `utils/factures/*` | `@/lib/lazy/vendors`, `@/hooks/*`, `@/local/db` | `uuid`, `xlsx`, `file-saver` (non importé), Web Crypto | Plusieurs modules JS avec imports concaténés ou manquants (`query`, `saveAs`) ; forte utilisation de `any` implicite |
| UI | `ui/Loading.tsx` (`Loading`) ; composants principaux dans `components/*` (Sidebar auto, LiquidBackground, etc.) | `@/components/ui/*`, `@/layout/*` | `react`, `lucide-react`, `@radix-ui/*` | Nombreux composants fonctionnels export défaut ; dépendances Radix/Tailwind ; pas d’anomalie majeure repérée dans l’échantillon |
| Pages | Voir §3 pour liste exhaustive | `@/hooks/*`, `@/components/*` | `react`, `react-router-dom` | 199 pages recensées ; 6 fichiers orphelins (doublons dossier `Parametrage`/`Debug`) |

## 2. Détails par domaine

### 2.1 Entrée / shell
- **`src/main.jsx`** : monte l’application dans `#root`, enveloppe `RouterProvider` dans `AuthProvider`, importe `@/services/analytics` uniquement pour déclarer les utilitaires ; dépend de `react`, `react-dom/client`, `react-router-dom` et des CSS globaux.
- **`src/App.jsx`** : composant racine gérant restauration de scroll, focus et évènements analytics (`useAnalyticsNavigationListener`) ; export défaut ; dépend des hooks React Router, `@/components/ui/Spinner`, `@/services/analytics`.
- **`src/AppShell.tsx`** : layout simple avec `<Sidebar />` et badge debug conditionnel ; export défaut.
- **`src/ScrollRestoration.jsx`** : composant placeholder (retourne `null`).
- **`src/PrivateOutlet.jsx` / `src/ProtectedRoute.jsx`** : gardes d’authentification ; construisent un `redirectTo` via `@/auth/redirect` et forcent la navigation vers `/login` si non authentifié.

### 2.2 App root & navigation latérale
- **`src/Sidebar.tsx`** : export défaut `Sidebar` + export nommé `resolveSidebarState` (retourne `showSidebar: true`). Utilise `SIDEBAR` (`@/config/sidebar`) et `react-router-dom` pour l’état actif. Pas de filtrage droits.
- **`src/config/sidebar.ts`** : définition statique des éléments de menu (structures `NavItem`). Plusieurs entrées pointent vers des routes inexistantes (`/produits`, `/fournisseurs`, `/factures`, `/menus`, `/couts/*`, `/inventaires`, `/achats-recommandes`, `/taches`, `/parametrage` racine) ou dupliquent des chemins enfants.

### 2.3 Router
- **`src/router.tsx`** : crée un `HashRouter` (`createHashRouter`), ajoute `RequireAuth` autour de `AppLayout`, redirige l’index vers `dashboard`, expose `appRouter`. Déclare explicitement les lazy routes `/setup`, `/login`, `/settings`, `/legal/*` et un `NotFound` avec `handle.isNotFound`.
- **`src/router.autogen.tsx`** : auto-généré, export `routes`. Chaque entrée enregistre un préchargement via `registerRoutePrefetch`. On note des doublons (`/parametrage/dossierdonnees`, `/parametrage/familles`, `/parametrage/sousfamilles`, `/parametrage/unites`).
- **`src/routerPrefetch.ts`** : registre de préchargement (`registerRoutePrefetch`, `prefetchRoute`). Normalise les chemins (ajoute slash final) et mutualise les promesses via `pendingLoads`.

### 2.4 Layouts
- **`AppLayout.jsx`** : wrapper principal (sidebar auto + `<Outlet />` + `Footer`), expose aussi `AppLayoutBoundary` pour capturer les erreurs.
- **`AdminLayout.jsx`** : layout sombre avec `Navbar` et `Sidebar`. Utilise `LiquidBackground`.
- **`Layout.jsx`** : version historique combinant notifications et `AlertBadge`.
- **`LegalLayout.jsx`** : layout légal (background animé + `Helmet` via `useLegalMeta` + boundary).
- **`ViewerLayout.jsx`** : layout simplifié (sans sidebar) centré.
- **`Navbar.jsx`** : gestion du thème (localStorage), toggle sidebar, recherche globale, boutons “Quitter & synchroniser” (via Tauri) et “Déconnexion” (redirection `/logout`).

### 2.5 Authentification & session
- **`context/AuthContext.tsx`** : fournit `AuthProvider` ; lit/écrit l’utilisateur via `readStoredUser`/`writeStoredUser` (sessionStorage via `sessionStore`), hydrate les rôles depuis `appFs`; expose `hasAccess` (utilise `@/utils/permissions`). Aucun bypass Tauri/dev.
- **`hooks/useAuth.ts`** : hook d’accès au contexte, normalise le statut (`loading`/`authenticated`/`unauthenticated`), ré-exporte `AuthProvider`.
- **`auth/RequireAuth.jsx`, `PrivateOutlet.jsx`, `ProtectedRoute.jsx`** : gardes qui stockent `redirectTo` (sessionStorage) et redirigent vers `/login`.
- **`auth/redirect.ts`** : construit et normalise les hash de redirection (par défaut `#/dashboard`), stocke via `sessionStore`.
- **`lib/auth/sessionStore.ts`** : wrapper autour `sessionStorage` avec fallback mémoire ; centralise `get/set/remove/clear`.
- **`lib/auth/sessionState.ts`** : expose `readStoredUser`, `writeStoredUser`, `readStoredToken`, `writeStoredToken`, `readStoredRedirect`, etc. Stocke seulement dans `sessionStorage` (via `sessionStore`).
- **`auth/localAccount.ts`** : gestion d’utilisateurs locaux (Tauri + fallback localStorage) ; écrit `firstRun` dans session flags ; fonctions `registerLocal`, `loginLocal`, `deleteUserLocal`.
- **`auth/sqlAccount.ts` / `auth/sqlAuth.ts` / `auth/sqliteAuth.ts`** : variantes SQL/SQLite reliant `openDb` ou `getDb`.
- **`auth/authAdapter.ts`** : hook `useAuthAdapter` reliant `loginLocal`/`registerLocal` au contexte.
- **`auth/AccessGate.tsx`** : refuse l’accès si aucun `user`/`access_rights` dans le contexte.

### 2.6 Services
- **`services/analytics.ts`** : API `trackEvent`, `trackPageView`, listener global sur évènement `app:navigation-complete`. État module (`lastProcessedKey`). Pas de side-effect lors de l’import, mais `main.jsx` l’importe quand même.
- **`services/inventory.ts`** : fonctions `createItem`, `getItemBySku`, `listItems`, `adjustStock` reposant sur `openDb` et `sumStockForItems` (gère stub mémoire).

### 2.7 Base de données
- **`lib/db/database.ts`** : charge le plugin SQL Tauri, fournit stub mémoire en dev (`ensureDevStub`). Exporte `getDb`, `openDb`, `closeDb`, `pingDb`, etc.
- **`db/index.ts`** : ré-export `openDb`, `initSchema`, `sumStock`, `sumStockForItems` (erreur TS : prédicat de filtrage retourne `id.length` number → bool attendu).
- **`db/client.ts` / `local/db.ts`** : wrappers minimalistes (import `getDb` + re-export) avec imports inutilisés (`isTauri`).
- **`db/connection.ts`** : expose `getMeta`/`setMeta` (SQLite `meta` table) avec guard `isTauri`.
- **`db/migrate.ts`** : applique scripts SQL depuis `migrationsList` (persistés dans `migrations.json` sous AppData Tauri).
- **`db/migrationsList.ts`** : liste `[001_schema, 002_seed]` (import raw SQL). `isTauri` importé mais non utilisé.

### 2.8 Utilitaires & divers
- **`utils/exportExcelProduits.js`** : exports `exportExcelProduits`, `downloadProduitsTemplate`. Manque les imports `query` et `saveAs`. `isTauri` importé sans usage.
- **`utils/importExcelProduits.js`** : imports en ligne concaténés (`LoadingSpinner` + `isTauri`), dépend de `@/local/db`, `uuid`, multiples hooks ; fonctions `validateProduitRow`, `parseProduitsFile`, `insertProduits` ; heavy usage de `any` implicites.
- **`utils/exportExcelProduits.js`, `utils/selectSafe.js`, `utils/formIds.js`, `utils/watermark.js`, `utils/number*.ts`** : fournissent helpers mais sans typage strict ; plusieurs imports `isTauri` non utilisés.
- **`constants`, `config/modules.js`, `lib/*`** : nombreux fichiers JS/TS non typés (commentaires TODO). À surveiller pour future migration.

### 2.9 UI
- **`ui/Loading.tsx`** : composant `Loading` (spinner minimal).
- **`components`** : vaste bibliothèque (sidebar autogen, LayoutErrorBoundary, LiquidBackground, etc.). Non détaillée ici ; se base sur exports défaut par fichier (voir `docs/FRONTMAP.md`). Aucun JSX invalide relevé lors de l’échantillonnage.

## 3. Pages & routing

### 3.1 Pages physiques (`src/pages/**/*.{jsx,tsx}`)

| Fichier                                            | Export défaut | Exports nommés | Routes déclarées                   |
| -------------------------------------------------- | ------------- | -------------- | ---------------------------------- |
| pages/Accueil.jsx                                  | oui           | non            | /accueil                           |
| pages/Alertes.jsx                                  | oui           | non            | /alertes                           |
| pages/BarManager.jsx                               | oui           | non            | /barmanager                        |
| pages/CartePlats.jsx                               | oui           | non            | /carteplats                        |
| pages/Consentements.jsx                            | oui           | non            | /consentements                     |
| pages/Dashboard.jsx                                | oui           | non            | /dashboard                         |
| pages/DbSetup.jsx                                  | oui           | non            | /dbsetup                           |
| pages/Debug/Auth.tsx                               | oui           | non            | —                                  |
| pages/Debug/AuthDebug.jsx                          | oui           | non            | —                                  |
| pages/DossierDonnees.jsx                           | oui           | non            | /dossierdonnees                    |
| pages/EngineeringMenu.jsx                          | oui           | non            | /engineeringmenu                   |
| pages/Feedback.jsx                                 | oui           | non            | /feedback                          |
| pages/Journal.jsx                                  | oui           | non            | /journal                           |
| pages/Login.jsx                                    | oui           | non            | /login                             |
| pages/NotFound.jsx                                 | oui           | non            | /notfound                          |
| pages/Parametrage/DossierDonnees.tsx               | oui           | non            | —                                  |
| pages/Parametrage/Familles.tsx                     | oui           | non            | —                                  |
| pages/Parametrage/SousFamilles.tsx                 | oui           | non            | —                                  |
| pages/Parametrage/Unites.tsx                       | oui           | non            | —                                  |
| pages/Parametres/Familles.jsx                      | oui           | non            | /parametres/familles               |
| pages/Pertes.jsx                                   | oui           | non            | /pertes                            |
| pages/Planning.jsx                                 | oui           | non            | /planning                          |
| pages/PlanningDetail.jsx                           | oui           | non            | /planningdetail                    |
| pages/PlanningForm.jsx                             | oui           | non            | /planningform                      |
| pages/PlanningModule.jsx                           | oui           | non            | /planningmodule                    |
| pages/Rgpd.jsx                                     | oui           | non            | /rgpd                              |
| pages/Settings.jsx                                 | oui           | non            | /settings                          |
| pages/Stock.jsx                                    | oui           | non            | /stock                             |
| pages/Utilisateurs.jsx                             | oui           | non            | /utilisateurs                      |
| pages/Validations.jsx                              | oui           | non            | /validations                       |
| pages/achats/AchatDetail.jsx                       | oui           | non            | /achats/achatdetail                |
| pages/achats/AchatForm.jsx                         | oui           | non            | /achats/achatform                  |
| pages/achats/Achats.jsx                            | oui           | non            | /achats/achats                     |
| pages/analyse/Analyse.jsx                          | oui           | non            | /analyse/analyse                   |
| pages/analyse/AnalyseCostCenter.jsx                | oui           | non            | /analyse/analysecostcenter         |
| pages/analyse/MenuEngineering.jsx                  | oui           | non            | /analyse/menuengineering           |
| pages/analyse/TableauxDeBord.jsx                   | oui           | non            | /analyse/tableauxdebord            |
| pages/analytique/AnalytiqueDashboard.jsx           | oui           | non            | /analytique/analytiquedashboard    |
| pages/auth/Blocked.jsx                             | oui           | non            | /auth/blocked                      |
| pages/auth/CreateMama.jsx                          | oui           | non            | /auth/createmama                   |
| pages/auth/Logout.jsx                              | oui           | non            | /auth/logout                       |
| pages/auth/Pending.jsx                             | oui           | non            | /auth/pending                      |
| pages/auth/ResetPassword.jsx                       | oui           | non            | /auth/resetpassword                |
| pages/auth/RoleError.jsx                           | oui           | non            | /auth/roleerror                    |
| pages/auth/Unauthorized.jsx                        | oui           | non            | /auth/unauthorized                 |
| pages/auth/UpdatePassword.jsx                      | oui           | non            | /auth/updatepassword               |
| pages/bons_livraison/BLCreate.jsx                  | oui           | non            | /bons_livraison/blcreate           |
| pages/bons_livraison/BLDetail.jsx                  | oui           | non            | /bons_livraison/bldetail           |
| pages/bons_livraison/BLForm.jsx                    | oui           | non            | /bons_livraison/blform             |
| pages/bons_livraison/BonsLivraison.jsx             | oui           | non            | /bons_livraison/bonslivraison      |
| pages/carte/Carte.jsx                              | oui           | non            | /carte/carte                       |
| pages/catalogue/CatalogueSyncViewer.jsx            | oui           | non            | /catalogue/cataloguesyncviewer     |
| pages/commandes/CommandeDetail.jsx                 | oui           | non            | /commandes/commandedetail          |
| pages/commandes/CommandeForm.jsx                   | oui           | non            | /commandes/commandeform            |
| pages/commandes/Commandes.jsx                      | oui           | non            | /commandes/commandes               |
| pages/commandes/CommandesEnvoyees.jsx              | oui           | non            | /commandes/commandesenvoyees       |
| pages/consolidation/AccessMultiSites.jsx           | oui           | non            | /consolidation/accessmultisites    |
| pages/consolidation/Consolidation.jsx              | oui           | non            | /consolidation/consolidation       |
| pages/costboisson/CostBoisson.jsx                  | oui           | non            | /costboisson/costboisson           |
| pages/costing/CostingCarte.jsx                     | oui           | non            | /costing/costingcarte              |
| pages/cuisine/MenuDuJour.jsx                       | oui           | non            | /cuisine/menudujour                |
| pages/dashboard/DashboardBuilder.jsx               | oui           | non            | /dashboard/dashboardbuilder        |
| pages/debug/AccessExample.jsx                      | oui           | non            | /debug/accessexample               |
| pages/debug/Auth.tsx                               | oui           | non            | /debug/auth                        |
| pages/debug/AuthDebug.jsx                          | oui           | non            | /debug/authdebug                   |
| pages/debug/Debug.jsx                              | oui           | non            | /debug/debug                       |
| pages/debug/DebugAuth.jsx                          | oui           | non            | /debug/debugauth                   |
| pages/debug/DebugRights.jsx                        | oui           | non            | /debug/debugrights                 |
| pages/debug/DebugUser.jsx                          | oui           | non            | /debug/debuguser                   |
| pages/documents/DocumentForm.jsx                   | oui           | non            | /documents/documentform            |
| pages/documents/Documents.jsx                      | oui           | non            | /documents/documents               |
| pages/ecarts/Ecarts.jsx                            | oui           | non            | /ecarts/ecarts                     |
| pages/emails/EmailsEnvoyes.jsx                     | oui           | non            | /emails/emailsenvoyes              |
| pages/engineering/MenuEngineering.jsx              | oui           | non            | /engineering/menuengineering       |
| pages/factures/FactureCreate.jsx                   | oui           | non            | /factures/facturecreate            |
| pages/factures/FactureDetail.jsx                   | oui           | oui            | /factures/facturedetail            |
| pages/factures/FactureForm.jsx                     | oui           | non            | /factures/factureform              |
| pages/factures/Factures.jsx                        | oui           | non            | /factures/factures                 |
| pages/factures/ImportFactures.jsx                  | oui           | non            | /factures/importfactures           |
| pages/fiches/FicheDetail.jsx                       | oui           | non            | /fiches/fichedetail                |
| pages/fiches/FicheForm.jsx                         | oui           | non            | /fiches/ficheform                  |
| pages/fiches/Fiches.jsx                            | oui           | non            | /fiches/fiches                     |
| pages/fournisseurs/ApiFournisseurForm.jsx          | non           | oui            | /fournisseurs/apifournisseurform   |
| pages/fournisseurs/ApiFournisseurs.jsx             | oui           | non            | /fournisseurs/apifournisseurs      |
| pages/fournisseurs/FournisseurApiSettingsForm.jsx  | oui           | non            | /fournisseurs/fournisseurapisettingsform |
| pages/fournisseurs/FournisseurCreate.jsx           | oui           | non            | /fournisseurs/fournisseurcreate    |
| pages/fournisseurs/FournisseurDetail.jsx           | oui           | non            | /fournisseurs/fournisseurdetail    |
| pages/fournisseurs/FournisseurDetailPage.jsx       | oui           | non            | /fournisseurs/fournisseurdetailpage |
| pages/fournisseurs/FournisseurForm.jsx             | oui           | non            | /fournisseurs/fournisseurform      |
| pages/fournisseurs/Fournisseurs.jsx                | oui           | non            | /fournisseurs/fournisseurs         |
| pages/fournisseurs/comparatif/ComparatifPrix.jsx   | oui           | non            | /fournisseurs/comparatif/comparatifprix |
| pages/fournisseurs/comparatif/PrixFournisseurs.jsx | oui           | non            | /fournisseurs/comparatif/prixfournisseurs |
| pages/inventaire/EcartInventaire.jsx               | oui           | non            | /inventaire/ecartinventaire        |
| pages/inventaire/Inventaire.jsx                    | oui           | non            | /inventaire/inventaire             |
| pages/inventaire/InventaireDetail.jsx              | oui           | non            | /inventaire/inventairedetail       |
| pages/inventaire/InventaireForm.jsx                | oui           | non            | /inventaire/inventaireform         |
| pages/inventaire/InventaireZones.jsx               | oui           | non            | /inventaire/inventairezones        |
| pages/legal/Cgu.jsx                                | oui           | non            | /legal/cgu                         |
| pages/legal/Cgv.jsx                                | oui           | non            | /legal/cgv                         |
| pages/legal/Confidentialite.jsx                    | oui           | non            | /legal/confidentialite             |
| pages/legal/Contact.jsx                            | oui           | non            | /legal/contact                     |
| pages/legal/Licence.jsx                            | oui           | non            | /legal/licence                     |
| pages/legal/MentionsLegales.jsx                    | oui           | non            | /legal/mentions-legales            |
| pages/menu/MenuDuJour.jsx                          | oui           | non            | /menu/menudujour                   |
| pages/menu/MenuDuJourJour.jsx                      | oui           | non            | /menu/menudujourjour               |
| pages/menus/MenuDetail.jsx                         | oui           | non            | /menus/menudetail                  |
| pages/menus/MenuDuJour.jsx                         | oui           | non            | /menus/menudujour                  |
| pages/menus/MenuDuJourDetail.jsx                   | oui           | non            | /menus/menudujourdetail            |
| pages/menus/MenuDuJourForm.jsx                     | oui           | non            | /menus/menudujourform              |
| pages/menus/MenuForm.jsx                           | oui           | non            | /menus/menuform                    |
| pages/menus/MenuGroupeDetail.jsx                   | oui           | non            | /menus/menugroupedetail            |
| pages/menus/MenuGroupeForm.jsx                     | oui           | non            | /menus/menugroupeform              |
| pages/menus/MenuGroupes.jsx                        | oui           | non            | /menus/menugroupes                 |
| pages/menus/MenuPDF.jsx                            | oui           | non            | /menus/menupdf                     |
| pages/menus/Menus.jsx                              | oui           | non            | /menus/menus                       |
| pages/mobile/MobileAccueil.jsx                     | oui           | non            | /mobile/mobileaccueil              |
| pages/mobile/MobileInventaire.jsx                  | oui           | non            | /mobile/mobileinventaire           |
| pages/mobile/MobileRequisition.jsx                 | oui           | non            | /mobile/mobilerequisition          |
| pages/notifications/NotificationSettingsForm.jsx   | oui           | non            | /notifications/notificationsettingsform |
| pages/notifications/NotificationsInbox.jsx         | oui           | non            | /notifications/notificationsinbox  |
| pages/parametrage/APIKeys.jsx                      | oui           | non            | /parametrage/apikeys               |
| pages/parametrage/AccessRights.jsx                 | oui           | non            | /parametrage/accessrights          |
| pages/parametrage/CentreCoutForm.jsx               | oui           | non            | /parametrage/centrecoutform        |
| pages/parametrage/ComptesLocaux.jsx                | oui           | non            | /parametrage/compteslocaux         |
| pages/parametrage/DossierDonnees.tsx               | oui           | non            | /parametrage/dossierdonnees        |
| pages/parametrage/ExportComptaPage.jsx             | oui           | non            | /parametrage/exportcomptapage      |
| pages/parametrage/ExportUserData.jsx               | oui           | non            | /parametrage/exportuserdata        |
| pages/parametrage/Familles.jsx                     | oui           | non            | /parametrage/familles<br>/parametrage/familles |
| pages/parametrage/InvitationsEnAttente.jsx         | oui           | non            | /parametrage/invitationsenattente  |
| pages/parametrage/InviteUser.jsx                   | oui           | non            | /parametrage/inviteuser            |
| pages/parametrage/MamaForm.jsx                     | oui           | non            | /parametrage/mamaform              |
| pages/parametrage/MamaSettingsForm.jsx             | oui           | non            | /parametrage/mamasettingsform      |
| pages/parametrage/Mamas.jsx                        | oui           | non            | /parametrage/mamas                 |
| pages/parametrage/Parametrage.jsx                  | oui           | non            | /parametrage/parametrage           |
| pages/parametrage/ParametresCommandes.jsx          | oui           | non            | /parametrage/parametrescommandes   |
| pages/parametrage/Periodes.jsx                     | oui           | non            | /parametrage/periodes              |
| pages/parametrage/Permissions.jsx                  | oui           | non            | /parametrage/permissions           |
| pages/parametrage/PermissionsAdmin.jsx             | oui           | non            | /parametrage/permissionsadmin      |
| pages/parametrage/PermissionsForm.jsx              | oui           | non            | /parametrage/permissionsform       |
| pages/parametrage/RGPDConsentForm.jsx              | oui           | non            | /parametrage/rgpdconsentform       |
| pages/parametrage/RoleForm.jsx                     | oui           | non            | /parametrage/roleform              |
| pages/parametrage/Roles.jsx                        | oui           | non            | /parametrage/roles                 |
| pages/parametrage/SousFamilles.jsx                 | oui           | non            | /parametrage/sousfamilles<br>/parametrage/sousfamilles |
| pages/parametrage/SystemTools.jsx                  | oui           | non            | /parametrage/systemtools           |
| pages/parametrage/TemplateCommandeForm.jsx         | oui           | non            | /parametrage/templatecommandeform  |
| pages/parametrage/TemplatesCommandes.jsx           | oui           | non            | /parametrage/templatescommandes    |
| pages/parametrage/Unites.jsx                       | oui           | non            | /parametrage/unites<br>/parametrage/unites |
| pages/parametrage/Utilisateurs.jsx                 | oui           | non            | /parametrage/utilisateurs          |
| pages/parametrage/ZoneAccess.jsx                   | oui           | non            | /parametrage/zoneaccess            |
| pages/parametrage/ZoneForm.jsx                     | oui           | non            | /parametrage/zoneform              |
| pages/parametrage/Zones.jsx                        | oui           | non            | /parametrage/zones                 |
| pages/planning/SimulationPlanner.jsx               | oui           | non            | /planning/simulationplanner        |
| pages/produits/ProduitDetail.jsx                   | oui           | non            | /produits/produitdetail            |
| pages/produits/ProduitForm.jsx                     | oui           | non            | /produits/produitform              |
| pages/produits/Produits.jsx                        | oui           | non            | /produits/produits                 |
| pages/promotions/PromotionForm.jsx                 | oui           | non            | /promotions/promotionform          |
| pages/promotions/Promotions.jsx                    | oui           | non            | /promotions/promotions             |
| pages/public/LandingPage.jsx                       | oui           | non            | /public/landingpage                |
| pages/public/Signup.jsx                            | oui           | non            | /public/signup                     |
| pages/receptions/Receptions.jsx                    | oui           | non            | /receptions/receptions             |
| pages/recettes/Recettes.jsx                        | oui           | non            | /recettes/recettes                 |
| pages/reporting/GraphCost.jsx                      | oui           | non            | /reporting/graphcost               |
| pages/reporting/Reporting.jsx                      | oui           | non            | /reporting/reporting               |
| pages/reporting/ReportingPDF.jsx                   | oui           | non            | /reporting/reportingpdf            |
| pages/requisitions/RequisitionDetail.jsx           | oui           | non            | /requisitions/requisitiondetail    |
| pages/requisitions/RequisitionForm.jsx             | oui           | non            | /requisitions/requisitionform      |
| pages/requisitions/Requisitions.jsx                | oui           | non            | /requisitions/requisitions         |
| pages/setup/FirstRun.jsx                           | oui           | non            | /setup/firstrun                    |
| pages/signalements/SignalementDetail.jsx           | oui           | non            | /signalements/signalementdetail    |
| pages/signalements/SignalementForm.jsx             | oui           | non            | /signalements/signalementform      |
| pages/signalements/Signalements.jsx                | oui           | non            | /signalements/signalements         |
| pages/simulation/Simulation.jsx                    | oui           | non            | /simulation/simulation             |
| pages/simulation/SimulationForm.jsx                | oui           | non            | /simulation/simulationform         |
| pages/simulation/SimulationMenu.jsx                | oui           | non            | /simulation/simulationmenu         |
| pages/simulation/SimulationResult.jsx              | oui           | non            | /simulation/simulationresult       |
| pages/stats/Stats.jsx                              | oui           | non            | /stats/stats                       |
| pages/stats/StatsAdvanced.jsx                      | oui           | non            | /stats/statsadvanced               |
| pages/stats/StatsConsolidation.jsx                 | oui           | non            | /stats/statsconsolidation          |
| pages/stats/StatsCostCenters.jsx                   | oui           | non            | /stats/statscostcenters            |
| pages/stats/StatsCostCentersPivot.jsx              | oui           | non            | /stats/statscostcenterspivot       |
| pages/stats/StatsFiches.jsx                        | oui           | non            | /stats/statsfiches                 |
| pages/stats/StatsStock.jsx                         | oui           | non            | /stats/statsstock                  |
| pages/stock/AlertesRupture.jsx                     | oui           | non            | /stock/alertesrupture              |
| pages/stock/Inventaire.jsx                         | oui           | non            | /stock/inventaire                  |
| pages/stock/InventaireForm.jsx                     | oui           | non            | /stock/inventaireform              |
| pages/stock/Requisitions.jsx                       | oui           | non            | /stock/requisitions                |
| pages/stock/TransfertForm.jsx                      | oui           | non            | /stock/transfertform               |
| pages/stock/Transferts.jsx                         | oui           | non            | /stock/transferts                  |
| pages/supervision/ComparateurFiches.jsx            | oui           | non            | /supervision/comparateurfiches     |
| pages/supervision/GroupeParamForm.jsx              | oui           | non            | /supervision/groupeparamform       |
| pages/supervision/Logs.jsx                         | oui           | non            | /supervision/logs                  |
| pages/supervision/Rapports.jsx                     | oui           | non            | /supervision/rapports              |
| pages/supervision/SupervisionGroupe.jsx            | oui           | non            | /supervision/supervisiongroupe     |
| pages/surcouts/Surcouts.jsx                        | oui           | non            | /surcouts/surcouts                 |
| pages/taches/Alertes.jsx                           | oui           | non            | /taches/alertes                    |
| pages/taches/TacheDetail.jsx                       | oui           | non            | /taches/tachedetail                |
| pages/taches/TacheForm.jsx                         | oui           | non            | /taches/tacheform                  |
| pages/taches/TacheNew.jsx                          | oui           | non            | /taches/tachenew                   |
| pages/taches/Taches.jsx                            | oui           | non            | /taches/taches                     |

### 3.2 Routes lazy déclarées dans `router.tsx`
- `/setup` & `/setup/firstrun` → `@/pages/setup/FirstRun` (prefetch partagé).
- `/login` → `@/pages/Login.jsx`.
- `/settings` → `@/pages/Settings.jsx`.
- `/legal/cgu`, `/legal/cgv`, `/legal/confidentialite`, `/legal/contact`, `/legal/licence`, `/legal/mentions-legales`, `/legal/rgpd`.
- Route wildcard `*` → `@/pages/NotFound.jsx`.

### 3.3 Pages orphelines (fichier sans route déclarée)
- `src/pages/Debug/Auth.tsx`
- `src/pages/Debug/AuthDebug.jsx`
- `src/pages/Parametrage/DossierDonnees.tsx`
- `src/pages/Parametrage/Familles.tsx`
- `src/pages/Parametrage/SousFamilles.tsx`
- `src/pages/Parametrage/Unites.tsx`

Ces doublons en majuscule ne sont pas consommés par le router (les équivalents minuscules le sont).

### 3.4 Routes cassées / divergences
- `SIDEBAR` pointe vers plusieurs chemins inexistants (`/produits`, `/fournisseurs`, `/factures`, `/menus`, `/couts/*`, `/inventaires`, `/achats-recommandes`, `/taches`, `/parametrage`). Les pages correspondantes vivent sous des sous-chemins (`/produits/produits`, etc.).
- Plusieurs routes autogen dupliquées pour le même chemin (ex: `/parametrage/dossierdonnees` enregistré deux fois) — risque d’avertissements React key et inutile pour Prefetch.
- Aucun import cassé détecté côté router : toutes les routes autogen mappent bien vers un fichier existant.

### 3.5 Legacy & redirections
`router.tsx` installe des redirections `Navigate` pour d’anciennes URL (`/cgu`, `/cgv`, `/mentions`, `/setup/firstrun`, etc.), converties en hash-compatible.

## 4. Sidebar
- **Doublons** : la structure `SIDEBAR` duplique certains chemins enfants (ex: entrée parent `/inventaires` + enfant `/inventaires`).
- **Liens morts** : voir §3.4 — la majorité des liens de premier niveau renvoient vers un chemin sans route index correspondante.
- **Accueil** : l’entrée « Accueil » pointe bien vers `#/accueil` (présente dans `router.autogen`).
- **Absence de filtrage** : aucune vérification d’accès dans `Sidebar.tsx`; la responsabilité repose sur la config `hide` manuelle.

## 5. Authentification & stockage session
- **Stockage utilisateur** : `readStoredUser`/`writeStoredUser` écrivent JSON dans `sessionStore` (donc `sessionStorage` lorsque disponible). `clearStoredUser` supprime la clé.
- **Jeton** : `readStoredToken`/`writeStoredToken` manipulent la clé `auth.token` (toujours `sessionStorage`).
- **RedirectTo** : `writeStoredRedirect` persiste la redirection (clé `redirectTo`) toujours via `sessionStore`.
- **Flags** : `setSessionFlag` / `setFirstRunComplete` stockent des booléens (`auth.flags`).
- **Pas de bypass** : ni `RequireAuth` ni `PrivateOutlet` n’exposent de mode dev/Tauri. Le seul code conditionnel Tauri concerne la persistence locale (`localAccount`, `appFs`).

## 6. Analytics
- `services/analytics.ts` définit l’abonnement `addNavigationAnalyticsListener`. Aucun effet secondaire lors de l’import ; l’écoute est démarrée par le hook `useAnalyticsNavigationListener` (appelé dans `App.jsx`).
- `main.jsx` importe `@/services/analytics` pour les effets secondaires — import inutile (peut être retiré ou remplacé par un hook).

## 7. Base de données
- Recherche plein texte : aucune trace du backend cloud historique (`rg` sur `src`).
- Entrée principale : `src/lib/db/database.ts` (Tauri plugin) ; stub mémoire pour le navigateur.
- `db/index.ts` expose les helpers d’agrégation (`sumStock*`) utilisés par `services/inventory.ts`.
- `db/migrate.ts` & `migrationsList.ts` orchestrent les migrations SQLite locales (fichiers `.sql` dans `src/migrations`).
- `local/db.ts` fournit un petit DAO pour les utilitaires front (ex: import Excel).

## 8. Build & typage
- `npx tsc --noEmit` échoue : prédicat de filtrage dans `src/db/index.ts` retourne `id.length` (type `number`) au lieu d’un booléen (`TS2322`).
- Plusieurs fichiers JS présentent des imports concaténés (`import ...;import ...;`) — syntaxe valide mais source de confusion.
- Modules utils non typés (`// @ts-nocheck`) ; usage massif de `any` implicite.

## 9. Imports cassés / cycles
- Aucun import manquant détecté via inspection manuelle (router + principaux services). Les modules utils présentent en revanche des dépendances manquantes (`query`, `saveAs`).
- Détection automatique de cycles non réalisée (installation de `madge` interdite). TODO : lancer la vérification avec les outils autorisés ou fournir un script maison.

## 10. TODO priorisés
1. **Corriger le routing Sidebar** : créer des routes index (`/produits`, `/fournisseurs`, etc.) ou ajuster les chemins de `SIDEBAR` pour pointer vers les URL existantes.
2. **Dédupliquer les routes autogen** (ex: `/parametrage/dossierdonnees`, `familles`, `sousfamilles`, `unites`) afin d’éviter double préchargement.
3. **Corriger l’erreur TypeScript** (`sumStockForItems` → convertir `id.length` en booléen explicite) pour faire passer `tsc`.
4. **Nettoyer les modules utilitaires** : ajouter les imports manquants (`query`, `saveAs`, etc.), supprimer les imports inutilisés (`isTauri`) et ajouter du typage.
5. **Retirer l’import side-effect d’analytics dans `main.jsx`** ou déplacer la logique dans un hook pour éviter les imports superflus.
6. **Documenter/assainir les doublons de pages orphelines** (`src/pages/Parametrage/*` en doublon majuscule, `src/pages/Debug/*`).
7. **Mettre en place un audit cycles/imports** dès qu’un outil interne est disponible (ou adapter les scripts existants).
