// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import LinkPrefetch from "@/components/LinkPrefetch";

import { useLegalMeta } from "@/layout/LegalLayout";

export default function Contact() {
  const legalMeta = useLegalMeta("Contact", "Support et assistance MamaStock");

  return (
    <>
      {legalMeta}
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-4 text-3xl font-bold">Nous contacter</h1>
        <p className="mb-6 max-w-xl text-center">
          Pour toute question sur l'application ou l'utilisation de vos données, vous pouvez
          nous écrire à&nbsp;
          <a href="mailto:contact@mamastock.com" className="text-mamastockGold underline">
            contact@mamastock.com
          </a>
          . Nous répondons généralement sous 48&nbsp;heures ouvrées.
        </p>
        <LinkPrefetch
          to="/"
          className="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-2 transition hover:bg-white/20 backdrop-blur-xl"
        >
          Retour à l'accueil
        </LinkPrefetch>
      </div>
    </>
  );
}
