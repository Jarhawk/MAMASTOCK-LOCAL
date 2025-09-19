// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";

import { useLegalMeta } from "@/layout/LegalLayout";

export default function Cgv() {
  const [text, setText] = useState("");
  const legalMeta = useLegalMeta("Conditions de vente", "CGV MamaStock");

  useEffect(() => {
    fetch("/legal/CGV.md")
      .then((r) => r.text())
      .then(setText);
  }, []);

  return (
    <>
      {legalMeta}
      <div className="mx-auto max-w-3xl whitespace-pre-wrap p-8">{text}</div>
    </>
  );
}
