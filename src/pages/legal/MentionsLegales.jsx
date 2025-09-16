// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";
import LegalLayout from "@/layout/LegalLayout";
import useMamaSettings from "@/hooks/useMamaSettings";import { isTauri } from "@/lib/tauriEnv";

export default function MentionsLegales() {
  const { settings } = useMamaSettings();
  const [text, setText] = useState("");

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
    <LegalLayout title="Mentions légales" description="Informations légales MamaStock">
      <div className="p-8 max-w-3xl mx-auto prose prose-invert whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} />
    </LegalLayout>);

}