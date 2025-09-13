// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/logo-mamastock.png";

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white/10 border border-white/10 backdrop-blur-xl text-white p-4 h-screen shadow-md text-shadow">
      <img src={logo} alt="MamaStock" className="h-20 mx-auto mt-4 mb-6" />
      <nav className="flex flex-col gap-2 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
        >
          Dashboard
        </NavLink>

        <details open={pathname.startsWith("/parametrage")}>
          <summary className="cursor-pointer">Paramétrage</summary>
          <div className="ml-4 flex flex-col gap-1 mt-1">
            <NavLink
              to="/parametrage/familles"
              className={({ isActive }) =>
                isActive ? "text-mamastockGold" : ""
              }
            >
              Familles
            </NavLink>
            <NavLink
              to="/parametrage/sous-familles"
              className={({ isActive }) =>
                isActive ? "text-mamastockGold" : ""
              }
            >
              Sous-familles
            </NavLink>
            <NavLink
              to="/parametrage/unites"
              className={({ isActive }) =>
                isActive ? "text-mamastockGold" : ""
              }
            >
              Unités
            </NavLink>
          </div>
        </details>

        <NavLink
          to="/data"
          className={({ isActive }) => (isActive ? "text-mamastockGold" : "")}
        >
          Dossier données
        </NavLink>

        <NavLink
          to="/debug/authdebug"
          className={({ isActive }) =>
            `text-xs opacity-50 mt-4 ${isActive ? "text-mamastockGold" : ""}`
          }
        >
          Debug Auth
        </NavLink>
      </nav>
    </aside>
  );
}

