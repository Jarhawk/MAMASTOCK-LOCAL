import React from "react";
import { NavLink } from "react-router-dom";
import { sidebarAuto } from "@/sidebar.autogen";

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-zinc-900 text-zinc-100 p-3 overflow-y-auto">
      {sidebarAuto.map(group => (
        <div key={group.title} className="mb-4">
          <div className="px-3 py-1 text-xs uppercase opacity-60">{group.title}</div>
          {group.items.map(it => (
            <NavLink key={it.to} to={it.to} className="block px-3 py-2 hover:bg-gray-100">
              {it.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
