// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { Link } from "react-router-dom";

import { useLegalMeta } from "@/layout/LegalLayout";

export default function Licence() {
  useLegalMeta("Licence", "Informations sur la licence MamaStock");

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="mb-4 text-3xl font-bold">Licence et abonnement</h1>
      <p className="mb-4 max-w-xl text-center">
        MamaStock est proposé sous forme d'abonnement SaaS. Chaque licence donne
        droit à l'utilisation du logiciel pour un établissement identifié.
        Pour connaître nos offres et recevoir un devis personnalisé, contactez-nous
        à&nbsp;
        <a href="mailto:commercial@mamastock.com" className="text-mamastockGold underline">
          commercial@mamastock.com
        </a>
        .
      </p>
      <p className="mb-6 max-w-xl text-center">
        Les conditions complètes de vente et de résiliation sont précisées dans les CGV.
      </p>
      <Link
        to="/"
        className="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-2 transition hover:bg-white/20 backdrop-blur-xl"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}