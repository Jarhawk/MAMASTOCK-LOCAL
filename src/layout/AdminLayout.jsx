import { Outlet } from "react-router-dom";

import Sidebar from "@/components/sidebar.autogen";
import Navbar from "@/layout/Navbar";
import {
  LiquidBackground,
  WavesBackground,
  MouseLight,
  TouchLight
} from "@/components/LiquidBackground";

/**
 * Layout général pour les pages accessibles aux admins/managers.
 * Inclut la Sidebar à gauche, et la Navbar en haut.
 */
export default function AdminLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden text-white text-shadow">
      <LiquidBackground showParticles />
      <WavesBackground className="opacity-40" />
      <MouseLight />
      <TouchLight />
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
