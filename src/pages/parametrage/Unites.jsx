// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { listUnites, createUnite, updateUnite, deleteUnite } from '@/lib/unites';
import ListingContainer from '@/components/ui/ListingContainer';
import TableHeader from '@/components/ui/TableHeader';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Unauthorized from '@/pages/auth/Unauthorized';
import { isTauri } from "@/lib/tauriEnv";

export default function Unites() {
  const { hasAccess, loading: authLoading } = useAuth();
  const canEdit = hasAccess('parametrage', 'peut_modifier');
  const [unites, setUnites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const forceTauri = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('forceTauri');

  const refresh = async () => {
    try {
      setLoading(true);
      if (isTauri() || forceTauri) {
        const data = await listUnites();
        setUnites(data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (edit?.id) {
        await updateUnite(edit.id, { code: edit.code, libelle: edit.libelle });
      } else {
        await createUnite({ code: edit.code, libelle: edit.libelle });
      }
      toast.success("Unité enregistrée");
      setEdit(null);
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      setDeleting(id);
      await deleteUnite(id);
      toast.success('Unité supprimée');
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Suppression échouée');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) return <LoadingSpinner message="Chargement..." />;
  if (!canEdit) return <Unauthorized />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Unités</h1>
      {!isTauri() && !forceTauri && (
        <p className="mb-2 text-sm text-yellow-700">Ouvre dans Tauri pour activer le SQL</p>
      )}
      <TableHeader className="gap-2">
        <Button onClick={() => setEdit({ code: '', libelle: '' })}>+ Nouvelle unité</Button>
      </TableHeader>
      <ListingContainer className="w-full overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="px-2 py-1">Code</th>
              <th className="px-2 py-1">Libellé</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {unites.map((u) => (
              <tr key={u.id}>
                <td className="px-2 py-1">{u.code}</td>
                <td className="px-2 py-1">{u.libelle}</td>
                <td className="px-2 py-1 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEdit(u)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={deleting === u.id}
                    onClick={() => handleDelete(u.id)}
                  >
                    {deleting === u.id ? '...' : 'Supprimer'}
                  </Button>
                </td>
              </tr>
            ))}
            {unites.length === 0 && (
              <tr>
                <td colSpan="3" className="py-2">
                  Aucune unité
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListingContainer>
      {edit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEdit(null)} />
          <div
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                className="input"
                placeholder="Code"
                required
                value={edit.code || ''}
                onChange={(e) => setEdit({ ...edit, code: e.target.value })}
              />
              <input
                className="input"
                placeholder="Libellé"
                required
                value={edit.libelle || ''}
                onChange={(e) => setEdit({ ...edit, libelle: e.target.value })}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setEdit(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? '...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

