// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-mamastock.png";
import { devFlags } from "@/lib/devFlags";

export function resolveSidebarState({ isDev, loading, access_rights, userData }) {
  const rightsPresent = Boolean(access_rights) || Boolean(userData?.access_rights);
  const hideBecauseLoading = !isDev && loading;
  const showSidebar = isDev ? true : rightsPresent;
  return {
    hideBecauseLoading,
    showSidebar
  };
}

export default function Sidebar() {
  const { loading, hasAccess, userData, access_rights, devFakeAuth } = useAuth();
  const { pathname } = useLocation();

  const state = resolveSidebarState({
    isDev: devFlags.isDev,
    loading,
    access_rights,
    userData
  });

  if (state.hideBecauseLoading) return null;
  if (!state.showSidebar) return null;

  const rights = access_rights ?? userData?.access_rights ?? {};
  const has = (key) => (devFlags.isDev ? true : hasAccess(key));
  const canAnalyse = devFlags.isDev || has("analyse");
  const canConfigure =
    devFlags.isDev ||
    rights?.enabledModules?.includes?.("parametrage") ||
    userData?.can_configurer ||
    has("parametrage");

  const showDevRibbon = devFlags.isDev || devFakeAuth;

  return (
    <aside className="relative w-64 bg-white/10 border border-white/10 backdrop-blur-xl text-white p-4 h-screen shadow-md text-shadow">
      {showDevRibbon && (
        <div className="absolute right-3 top-3 flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
          DEV
        </div>
      )}
      <img src={logo} alt="MamaStock" className="h-20 mx-auto mt-4 mb-6" />

      {showDevRibbon && (
        <div className="mb-4 text-[10px] uppercase tracking-widest text-mamastockGold text-center">
          Mode DEV — accès libre
        </div>
      )}

      <nav className="flex flex-col gap-2 text-sm">
        {has("dashboard") && <Link to="/dashboard">Dashboard</Link>}

        {(has("fournisseurs") || has("factures")) && (
          <details open={pathname.startsWith("/fournisseurs") || pathname.startsWith("/factures")}>
            <summary className="cursor-pointer">Achats</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {has("fournisseurs") && <Link to="/fournisseurs">Fournisseurs</Link>}
              {has("factures") && <Link to="/factures">Factures</Link>}
            </div>
          </details>
        )}

        {(has("fiches_techniques") || has("menus")) && (
          <details open={pathname.startsWith("/fiches") || pathname.startsWith("/menus")}>
            <summary className="cursor-pointer">Cuisine</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {has("fiches_techniques") && <Link to="/fiches">Fiches</Link>}
              {has("menus") && <Link to="/menus">Menus</Link>}
              {has("menu_du_jour") && <Link to="/menu">Menu du jour</Link>}
            </div>
          </details>
        )}

        {(has("produits") || has("inventaires")) && (
          <details open={pathname.startsWith("/produits") || pathname.startsWith("/inventaire")}>
            <summary className="cursor-pointer">Stock</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {has("produits") && <Link to="/produits">Produits</Link>}
              {has("inventaires") && <Link to="/inventaire">Inventaire</Link>}
            </div>
          </details>
        )}

        {(has("alertes") || has("promotions")) && (
          <details open={pathname.startsWith("/alertes") || pathname.startsWith("/promotions")}>
            <summary className="cursor-pointer">Alertes / Promotions</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {has("alertes") && <Link to="/alertes">Alertes</Link>}
              {has("promotions") && <Link to="/promotions">Promotions</Link>}
            </div>
          </details>
        )}

        {(has("documents") || canAnalyse || has("menu_engineering")) && (
          <details
            open={
              pathname.startsWith("/documents") ||
              pathname.startsWith("/analyse") ||
              pathname.startsWith("/engineering") ||
              pathname.startsWith("/menu-engineering")
            }
          >
            <summary className="cursor-pointer">Documents / Analyse</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {has("documents") && <Link to="/documents">Documents</Link>}
              {canAnalyse && <Link to="/analyse">Analyse</Link>}
              {has("menu_engineering") && <Link to="/menu-engineering">Menu Engineering</Link>}
              {canAnalyse && <Link to="/engineering">Engineering</Link>}
              {has("costing_carte") && <Link to="/costing/carte">Costing Carte</Link>}
            </div>
          </details>
        )}

        {has("notifications") && <Link to="/notifications">Notifications</Link>}

        {(canConfigure || has("utilisateurs") || has("roles") || has("mamas") || has("permissions") || has("access")) && (
          <details open={pathname.startsWith("/parametrage")}>
            <summary className="cursor-pointer">Paramétrage</summary>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              {canConfigure && (
                <NavLink
                  to="/parametrage/familles"
                  className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
                >
                  Familles
                </NavLink>
              )}
              {canConfigure && (
                <NavLink
                  to="/parametrage/sousfamilles"
                  className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
                >
                  Sous-familles
                </NavLink>
              )}
              {canConfigure && (
                <NavLink
                  to="/parametrage/unites"
                  className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
                >
                  Unités
                </NavLink>
              )}
              {canConfigure && (
                <NavLink
                  to="/dossierdonnees"
                  className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
                >
                  Dossier données
                </NavLink>
              )}
              {has("utilisateurs") && <Link to="/parametrage/utilisateurs">Utilisateurs</Link>}
              {has("roles") && <Link to="/parametrage/roles">Rôles</Link>}
              {has("mamas") && <Link to="/parametrage/mamas">Mamas</Link>}
              {has("permissions") && <Link to="/parametrage/permissions">Permissions</Link>}
              {has("access") && <Link to="/parametrage/access">Accès</Link>}
            </div>
          </details>
        )}
        <NavLink
          to="/debug/authdebug"
          className={({ isActive }) => `text-xs opacity-50 mt-4 ${isActive ? "text-mamastockGold" : ""}`}
        >
          Debug Auth
        </NavLink>
      </nav>
    </aside>
  );
}
