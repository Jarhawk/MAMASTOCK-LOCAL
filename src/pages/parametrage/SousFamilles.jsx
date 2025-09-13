// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  listSousFamilles,
  createSousFamille,
  updateSousFamille,
  deleteSousFamille,
} from '@/lib/sousFamilles';
import { listFamilles } from '@/lib/familles';
import ListingContainer from '@/components/ui/ListingContainer';
import TableHeader from '@/components/ui/TableHeader';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Unauthorized from '@/pages/auth/Unauthorized';
import { isTauri } from '@/lib/db/sql';

export default function SousFamilles() {
  const { hasAccess, loading: authLoading } = useAuth();
  const canEdit = hasAccess('parametrage', 'peut_modifier');
  const [sousFamilles, setSousFamilles] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const forceTauri =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('forceTauri');

  const refresh = async () => {
    try {
      setLoading(true);
      if (isTauri || forceTauri) {
        const [sf, f] = await Promise.all([listSousFamilles(), listFamilles()]);
        setSousFamilles(sf);
        setFamilles(f);
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
        await updateSousFamille(edit.id, {
          famille_id: edit.famille_id,
          code: edit.code,
          libelle: edit.libelle,
        });
      } else {
        await createSousFamille({
          famille_id: edit.famille_id,
          code: edit.code,
          libelle: edit.libelle,
        });
      }
      toast.success('Sous-famille enregistrée');
      setEdit(null);
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      setDeleting(id);
      await deleteSousFamille(id);
      toast.success('Sous-famille supprimée');
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error('Suppression échouée');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) return <LoadingSpinner message="Chargement..." />;
  if (!canEdit) return <Unauthorized />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sous-familles</h1>
      {!isTauri && !forceTauri && (
        <p className="mb-2 text-sm text-yellow-700">Ouvre dans Tauri pour activer le SQL</p>
      )}
      <TableHeader className="gap-2">
        <Button
          onClick={() =>
            setEdit({ famille_id: familles[0]?.id, code: '', libelle: '' })
          }
        >
          + Nouvelle sous-famille
        </Button>
      </TableHeader>
      <ListingContainer className="w-full overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="px-2 py-1">Code</th>
              <th className="px-2 py-1">Libellé</th>
              <th className="px-2 py-1">Famille</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sousFamilles.map((sf) => (
              <tr key={sf.id}>
                <td className="px-2 py-1">{sf.code}</td>
                <td className="px-2 py-1">{sf.libelle}</td>
                <td className="px-2 py-1">
                  {familles.find((f) => f.id === sf.famille_id)?.libelle || ''}
                </td>
                <td className="px-2 py-1 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEdit(sf)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={deleting === sf.id}
                    onClick={() => handleDelete(sf.id)}
                  >
                    {deleting === sf.id ? '...' : 'Supprimer'}
                  </Button>
                </td>
              </tr>
            ))}
            {sousFamilles.length === 0 && (
              <tr>
                <td colSpan="4" className="py-2">
                  Aucune sous-famille
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
              <select
                className="input"
                value={edit.famille_id || ''}
                onChange={(e) =>
                  setEdit({ ...edit, famille_id: Number(e.target.value) })
                }
              >
                <option value="">Sélectionner une famille</option>
                {familles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.libelle}
                  </option>
                ))}
              </select>
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

