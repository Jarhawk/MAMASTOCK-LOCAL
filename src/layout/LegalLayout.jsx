import { Suspense, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Footer from "@/components/Footer";
import {
  LiquidBackground,
  WavesBackground,
  MouseLight,
  TouchLight
} from "@/components/LiquidBackground";
import LayoutErrorBoundary from "@/components/LayoutErrorBoundary";
import Spinner from "@/components/ui/Spinner";

export function useLegalMeta(title = "", description = "") {
  const pageTitle = title ? `${title} - MamaStock` : "MamaStock";
  const metaDescription = description
    ? description
    : "MamaStock - Informations légales et politiques de confidentialité";

  return useMemo(
    () => (
      <Helmet prioritizeSeoTags>
        <title key="title">{pageTitle}</title>
        <meta key="description" name="description" content={metaDescription} />
      </Helmet>
    ),
    [metaDescription, pageTitle]
  );
}

export default function LegalLayout() {
  const updated = new Date().toLocaleDateString("fr-FR");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <LiquidBackground showParticles />
      <WavesBackground className="opacity-40" />
      <MouseLight />
      <TouchLight />
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        className="relative z-10 flex flex-grow flex-col items-center px-4 py-16 focus:outline-none"
      >
        <Suspense fallback={<Spinner label="Chargement du contenu légal…" />}>
          <Outlet />
        </Suspense>
        <p className="mt-4 text-sm opacity-70">
          Dernière mise à jour : {updated}
        </p>
      </main>
      <Footer />
    </div>
  );
}

export function LegalLayoutBoundary({ children }) {
  return (
    <LayoutErrorBoundary
      title="Erreur sur la section légale"
      message="La page légale demandée est momentanément indisponible. Merci de revenir en arrière ou de réessayer plus tard."
    >
      {children}
    </LayoutErrorBoundary>
  );
}
