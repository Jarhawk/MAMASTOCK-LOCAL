import React from "react";
import { NavLink } from "react-router-dom";
import { SIDEBAR, NavItem } from "@/config/sidebar";

function Item({ item }: { item: NavItem }) {
  if (item.hide) return null;
  return (
    <div className="mb-1">
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          "block px-3 py-2 rounded " + (isActive ? "bg-zinc-800 text-white" : "hover:bg-zinc-800/50")
        }
      >
        {item.label}
      </NavLink>
      {item.children?.length ? (
        <div className="ml-3 mt-1 space-y-1">
          {item.children.map((c) => (
            <Item key={c.path} item={c} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-zinc-900 text-zinc-100 p-3 overflow-y-auto">
      {SIDEBAR.map((it) => (
        <Item key={it.path} item={it} />
      ))}
    </aside>
  );
}
