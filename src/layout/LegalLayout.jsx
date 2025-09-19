import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Footer from "@/components/Footer";
import {
  LiquidBackground,
  WavesBackground,
  MouseLight,
  TouchLight
} from "@/components/LiquidBackground";

export function useLegalMeta(title = "", description = "") {
  useEffect(() => {
    if (title) {
      document.title = `${title} - MamaStock`;
    }
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  }, [title, description]);
}

export default function LegalLayout() {
  const updated = new Date().toLocaleDateString("fr-FR");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <LiquidBackground showParticles />
      <WavesBackground className="opacity-40" />
      <MouseLight />
      <TouchLight />
      <main className="relative z-10 flex flex-grow flex-col items-center px-4 py-16">
        <Outlet />
        <p className="mt-4 text-sm opacity-70">
          Dernière mise à jour : {updated}
        </p>
      </main>
      <Footer />
    </div>
  );
}
