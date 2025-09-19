import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex w-64">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
