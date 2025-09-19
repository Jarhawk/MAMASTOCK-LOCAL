// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";

import { useLegalMeta } from "@/layout/LegalLayout";
import useMamaSettings from "@/hooks/useMamaSettings";

export default function Confidentialite() {
  const { settings } = useMamaSettings();
  const [text, setText] = useState("");

  useLegalMeta(
    "Politique de confidentialité",
    "Politique de confidentialité MamaStock"
  );

  useEffect(() => {
    async function fetchText() {
      if (settings?.rgpd_text) {
        setText(settings.rgpd_text);
        return;
      }
      const res = await fetch("/legal/politique_confidentialite.md");
      setText(await res.text());
    }
    void fetchText();
  }, [settings?.rgpd_text]);

  return (
    <div
      className="prose prose-invert mx-auto max-w-3xl whitespace-pre-wrap p-8"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}