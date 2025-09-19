import { Outlet } from "react-router-dom";

import Navbar from "@/layout/Navbar";
import {
  LiquidBackground,
  WavesBackground,
  MouseLight,
  TouchLight
} from "@/components/LiquidBackground";

/**
 * Layout pour les utilisateurs en lecture seule (viewer).
 * Pas de sidebar, uniquement la navbar + contenu centré.
 */
export default function ViewerLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white text-shadow">
      <LiquidBackground showParticles />
      <WavesBackground className="opacity-40" />
      <MouseLight />
      <TouchLight />
      <Navbar />
      <main className="relative z-10 flex flex-1 items-start justify-center overflow-y-auto px-4 py-6">
        <div className="w-full max-w-5xl rounded-xl border border-white/20 bg-white/10 p-6 text-white shadow-md backdrop-blur-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
