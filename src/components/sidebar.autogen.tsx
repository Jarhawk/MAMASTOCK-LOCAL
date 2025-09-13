import React from "react";
import { NavLink } from "react-router-dom";

export type SidebarItem = { path: string; label: string; icon?: string; children?: SidebarItem[] };
export const SIDEBAR: SidebarItem[] = [
  {
    "label": "Dashboard",
    "children": [
      {
        "path": "/dashboard",
        "label": "Dashboard"
      }
    ]
  },
  {
    "label": "Parametrage",
    "children": [
      {
        "path": "/parametrage/familles",
        "label": "Familles"
      },
      {
        "path": "/parametrage/sousfamilles",
        "label": "SousFamilles"
      },
      {
        "path": "/parametrage/unites",
        "label": "Unites"
      }
    ]
  },
  {
    "label": "DossierDonnees",
    "children": [
      {
        "path": "/dossierdonnees",
        "label": "DossierDonnees"
      }
    ]
  },
  {
    "label": "Debug",
    "children": [
      {
        "path": "/debug/authdebug",
        "label": "AuthDebug"
      }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r h-full overflow-auto">
      {SIDEBAR.map(section => (
        <div key={section.label} className="p-3">
          <div className="text-xs font-semibold opacity-70 mb-2">{section.label}</div>
          {section.children?.map(it => (
            <NavLink
              key={it.path}
              to={it.path}
              className={({ isActive }) =>
                "block px-3 py-2 rounded hover:bg-gray-100 " + (isActive ? "bg-gray-100 font-medium" : "")
              }
            >
              {it.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
