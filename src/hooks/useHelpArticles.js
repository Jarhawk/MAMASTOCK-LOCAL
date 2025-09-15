// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { readText, saveText, existsFile } from "@/local/files";import { isTauri } from "@/lib/runtime/isTauri";

const FILE_PATH = "help/articles.json";

async function readArticles() {
  if (!(await existsFile(FILE_PATH))) return [];
  try {
    const txt = await readText(FILE_PATH);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeArticles(list) {
  await saveText(FILE_PATH, JSON.stringify(list, null, 2));
}

export function useHelpArticles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    try {
      const data = await readArticles();
      setItems(data);
      return data;
    } catch (err) {
      setError(err?.message || String(err));
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function addArticle(values) {
    setLoading(true);
    setError(null);
    try {
      const arr = await readArticles();
      const article = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...values };
      arr.push(article);
      await writeArticles(arr);
      await fetchArticles();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function updateArticle(id, values) {
    setLoading(true);
    setError(null);
    try {
      const arr = await readArticles();
      const idx = arr.findIndex((a) => a.id === id);
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], ...values };
        await writeArticles(arr);
      }
      await fetchArticles();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id) {
    setLoading(true);
    setError(null);
    try {
      const arr = await readArticles();
      const filt = arr.filter((a) => a.id !== id);
      await writeArticles(filt);
      await fetchArticles();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return {
    items,
    loading,
    error,
    fetchArticles,
    addArticle,
    updateArticle,
    deleteArticle
  };
}