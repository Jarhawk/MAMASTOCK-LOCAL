// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// fix: avoid ilike.%% on empty search.
import { useState, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import { uploadFile, deleteFile, pathFromUrl } from "@/hooks/useStorage";
import { documents_list, document_add, document_delete, document_get } from "@/local/documents";import { isTauri } from "@/lib/db/sql";

export function useDocuments() {
  const { mama_id } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listDocuments = useCallback(async (filters = {}) => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await documents_list({ ...filters, mama_id });
      setDocuments(Array.isArray(data) ? data : []);
      return data || [];
    } catch (err) {
      setError(err.message || err);
      setDocuments([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const uploadDocument = useCallback(
    async (file, metadata = {}) => {
      if (!mama_id || !file) return { error: "Aucun fichier" };
      setLoading(true);
      setError(null);
      try {
        const folder = metadata.entite_liee_type ?
        `${metadata.entite_liee_type}s` :
        "misc";
        const url = await uploadFile("mamastock-documents", file, folder);
        const doc = {
          id: crypto.randomUUID(),
          nom: file.name,
          type: file.type,
          taille: file.size,
          categorie: metadata.categorie || null,
          url,
          fichier_url: url,
          titre: metadata.titre || file.name,
          commentaire: metadata.commentaire || null,
          entite_liee_type: metadata.entite_liee_type || null,
          entite_liee_id: metadata.entite_liee_id || null,
          mama_id,
          created_at: new Date().toISOString()
        };
        await document_add(doc);
        setDocuments((d) => [doc, ...d]);
        return { data: doc };
      } catch (err) {
        setError(err.message || err);
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  const getDocumentUrl = useCallback(
    async (id) => {
      if (!id || !mama_id) return null;
      try {
        const doc = await document_get(id);
        return doc?.fichier_url || doc?.url || null;
      } catch (err) {
        setError(err.message || err);
        return null;
      }
    },
    [mama_id]
  );

  const deleteDocument = useCallback(
    async (id) => {
      if (!id || !mama_id) return { error: "Aucun id" };
      setLoading(true);
      setError(null);
      const doc = await document_delete(id);
      if (!doc) {
        setLoading(false);
        return { error: "not-found" };
      }
      const path = pathFromUrl(doc.fichier_url || doc.url);
      try {
        await deleteFile("mamastock-documents", path);
      } catch {

        /* ignore */}
      setDocuments((d) => d.filter((x) => x.id !== id));
      setLoading(false);
      return { success: true };
    },
    [mama_id]
  );

  return {
    documents,
    loading,
    error,
    listDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentUrl
  };
}