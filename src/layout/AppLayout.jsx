import Sidebar from "@/components/sidebar.autogen";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";import { isTauri } from "@/lib/db/sql";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>);

}