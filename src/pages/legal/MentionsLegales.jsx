// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";

import { useLegalMeta } from "@/layout/LegalLayout";
import useMamaSettings from "@/hooks/useMamaSettings";

export default function MentionsLegales() {
  const { settings } = useMamaSettings();
  const [text, setText] = useState("");

  useLegalMeta("Mentions légales", "Informations légales MamaStock");

  useEffect(() => {
    async function fetchText() {
      if (settings?.mentions_legales) {
        setText(settings.mentions_legales);
        return;
      }
      const res = await fetch("/legal/mentions_legales.md");
      setText(await res.text());
    }
    void fetchText();
  }, [settings?.mentions_legales]);

  return (
    <div
      className="prose prose-invert mx-auto max-w-3xl whitespace-pre-wrap p-8"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}