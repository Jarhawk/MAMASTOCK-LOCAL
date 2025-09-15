// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";
import LegalLayout from "@/layout/LegalLayout";
import useMamaSettings from "@/hooks/useMamaSettings";import { isTauri } from "@/lib/db/sql";

export default function Confidentialite() {
  const { settings } = useMamaSettings();
  const [text, setText] = useState("");

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
    <LegalLayout title="Politique de confidentialité" description="Politique de confidentialité MamaStock">
      <div className="p-8 max-w-3xl mx-auto prose prose-invert whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} />
    </LegalLayout>);

}