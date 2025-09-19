// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";

import { useLegalMeta } from "@/layout/LegalLayout";

export default function Cgu() {
  const [text, setText] = useState("");

  useLegalMeta("Conditions d'utilisation", "CGU MamaStock");

  useEffect(() => {
    fetch("/legal/CGU.md")
      .then((r) => r.text())
      .then(setText);
  }, []);

  return (
    <div className="mx-auto max-w-3xl whitespace-pre-wrap p-8">{text}</div>
  );
}