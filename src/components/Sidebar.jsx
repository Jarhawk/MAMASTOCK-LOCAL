import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white md:relative">
      <div className="flex items-center justify-between px-3 py-4 md:justify-start">
        <span className="text-lg font-semibold">MAMASTOCK</span>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-1 px-2 py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="px-3 py-2 text-xs text-gray-300">
          Connecté en tant que {user.email ?? "utilisateur"}
        </div>
      )}
    </div>
  );
}
