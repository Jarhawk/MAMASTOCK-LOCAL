import { useEffect, useState, useCallback } from "react";
import { readText, existsFile } from "@/local/files";

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/runtime/isTauri";

const FILE_PATH = "config/consentements.json";

async function readAll() {
  if (!(await existsFile(FILE_PATH))) return [];
  try {
    const txt = await readText(FILE_PATH);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function useConsentements() {
  const { id: user_id, mama_id } = useAuth();
  const [consentements, setConsentements] = useState([]);

  const fetchConsentements = useCallback(
    async (utilisateurId = user_id) => {
      if (!mama_id || !utilisateurId) return [];
      const all = await readAll();
      const list = all.filter(
        (c) => c.mama_id === mama_id && c.utilisateur_id === utilisateurId
      ).sort((a, b) =>
      (b.date_consentement || "").localeCompare(a.date_consentement || "")
      );
      setConsentements(list);
      return list;
    },
    [mama_id, user_id]
  );

  useEffect(() => {
    fetchConsentements();
  }, [fetchConsentements]);

  return { consentements, fetchConsentements };
}