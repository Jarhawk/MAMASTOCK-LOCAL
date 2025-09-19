import { Link, useMatch, useResolvedPath } from "react-router-dom";

import { SIDEBAR, type NavItem } from "./config/sidebar";

export type SidebarState = {
  hideBecauseLoading: boolean;
  showSidebar: boolean;
};

export function resolveSidebarState(
  _context?: Partial<{
    isDev: boolean;
    loading: boolean;
    access_rights: unknown;
    userData: unknown;
  }>
): SidebarState {
  return {
    hideBecauseLoading: false,
    showSidebar: true,
  };
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

type SidebarItemProps = {
  item: NavItem;
  depth?: number;
};

function SidebarLink({ item, depth = 0, hasChildren }: { item: NavItem; depth?: number; hasChildren: boolean }) {
  const target = normalizePath(item.path);
  const resolved = useResolvedPath(target);
  const match = useMatch({ path: resolved.pathname, end: !hasChildren });
  const isActive = Boolean(match);

  const depthClass =
    depth === 0 ? "" : depth === 1 ? "pl-3" : depth === 2 ? "pl-6" : "pl-9";

  return (
    <Link
      to={target}
      data-state={isActive ? "active" : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${depthClass} ${
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span className="truncate">{item.label}</span>
      {hasChildren ? <span className="opacity-60 transition-opacity group-hover:opacity-100">›</span> : null}
    </Link>
  );
}

function SidebarItem({ item, depth = 0 }: SidebarItemProps) {
  if (item.hide) {
    return null;
  }

  const children = item.children?.filter((child) => !child.hide) ?? [];
  const hasChildren = children.length > 0;

  return (
    <li>
      <SidebarLink item={item} depth={depth} hasChildren={hasChildren} />
      {hasChildren ? (
        <ul className="mt-1 space-y-1">
          {children.map((child) => (
            <SidebarItem key={child.path} item={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function Sidebar() {
  return (
    <div className="flex h-full min-h-full flex-col bg-background text-foreground">
      <div className="px-4 py-5">
        <p className="text-lg font-semibold">MAMASTOCK</p>
        <p className="text-xs text-foreground/60">Gestion au quotidien</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <ul className="space-y-1">
          {SIDEBAR.filter((item) => !item.hide).map((item) => (
            <SidebarItem key={item.path} item={item} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
