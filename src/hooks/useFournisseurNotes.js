// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import {
  fournisseur_notes_list,
  fournisseur_notes_add,
  fournisseur_notes_delete } from
"@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";

export function useFournisseurNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchNotes(fournisseur_id) {
    setLoading(true);
    setError(null);
    try {
      const rows = await fournisseur_notes_list(fournisseur_id);
      setNotes(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err.message || "Erreur chargement des notes fournisseur.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function addNote(note) {
    await fournisseur_notes_add(note);
  }

  async function deleteNote(id) {
    await fournisseur_notes_delete(id);
  }

  return {
    notes,
    loading,
    error,
    fetchNotes,
    addNote,
    deleteNote
  };
}