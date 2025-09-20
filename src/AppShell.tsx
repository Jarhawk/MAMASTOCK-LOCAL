import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-background">
        <Sidebar />
      </aside>
      <main
        id="content"
        tabIndex={-1}
        role="main"
        data-router-scroll-container
        className="flex-1 bg-background text-foreground focus:outline-none"
      >
        <Outlet />
      </main>
      {import.meta.env.PROD && import.meta.env.VITE_SHOW_SIDEBAR_DEBUG === "1" && (
        <div className="fixed bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          SIDEBAR OK
        </div>
      )}
    </div>
  );
}
