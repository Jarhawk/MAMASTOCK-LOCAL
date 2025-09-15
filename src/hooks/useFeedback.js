// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { readText, saveText, existsFile } from "@/local/files";

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/db/sql";

const FILE_PATH = "feedback.json";

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

async function writeAll(list) {
  await saveText(FILE_PATH, JSON.stringify(list, null, 2));
}

export function useFeedback() {
  const { mama_id, id: user_id } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const all = await readAll();
      const data = all.filter((f) => f.mama_id === mama_id && f.actif);
      setItems(data);
      return data;
    } catch (err) {
      setError(err?.message || String(err));
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const addFeedback = useCallback(
    async (values) => {
      if (!mama_id || !user_id) return { error: "Aucun utilisateur" };
      setLoading(true);
      setError(null);
      try {
        const arr = await readAll();
        const fb = {
          id: crypto.randomUUID(),
          mama_id,
          user_id,
          actif: true,
          created_at: new Date().toISOString(),
          ...values
        };
        arr.unshift(fb);
        await writeAll(arr);
        setItems(arr);
        return { success: true };
      } catch (err) {
        setError(err?.message || String(err));
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [mama_id, user_id]
  );

  return { items, loading, error, fetchFeedback, addFeedback };
}