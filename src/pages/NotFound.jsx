// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { Helmet } from "react-helmet-async";
import LinkPrefetch from "@/components/LinkPrefetch";

import {
  LiquidBackground,
  WavesBackground,
  MouseLight,
  TouchLight,
} from "@/components/LiquidBackground";

export default function NotFound() {
  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>Page non trouvée - MamaStock</title>
        <meta name="description" content="La page demandée est introuvable sur MamaStock" />
      </Helmet>
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        className="relative flex min-h-screen items-center justify-center overflow-hidden text-white focus:outline-none"
      >
        <LiquidBackground showParticles />
        <WavesBackground className="opacity-40" />
        <MouseLight />
        <TouchLight />

        <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 px-12 py-16 text-center shadow-2xl backdrop-blur-xl">
          <h1 className="mb-4 text-6xl font-bold text-mamastockGold drop-shadow-md">404</h1>
          <p className="mb-6 text-xl text-mamastockText">Page non trouvée</p>
          <LinkPrefetch
            to="/"
            className="inline-block rounded-xl bg-mamastockGold px-6 py-2 font-semibold text-white shadow transition hover:bg-[#b89730]"
          >
            Retour à l’accueil
          </LinkPrefetch>
        </div>
      </main>
    </>
  );
}
