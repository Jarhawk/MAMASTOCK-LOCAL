// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { listUnites, createUnite, deleteUnite } from '@/lib/unites';
import ListingContainer from '@/components/ui/ListingContainer';
import TableHeader from '@/components/ui/TableHeader';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Unauthorized from '@/pages/auth/Unauthorized';

export default function Unites() {
  const { hasAccess, loading: authLoading } = useAuth();
  const canEdit = hasAccess('parametrage', 'peut_modifier');
  const [unites, setUnites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', libelle: '' });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listUnites();
      setUnites(data);
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
      await createUnite(form.code, form.libelle);
      toast.success('Unité créée');
      setForm({ code: '', libelle: '' });
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      await deleteUnite(id);
      toast.success('Unité supprimée');
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Suppression échouée');
    }
  };

  if (authLoading || loading) return <LoadingSpinner message="Chargement..." />;
  if (!canEdit) return <Unauthorized />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Unités</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          className="input"
          placeholder="Libellé"
          required
          value={form.libelle}
          onChange={(e) => setForm({ ...form, libelle: e.target.value })}
        />
        <Button type="submit">Ajouter</Button>
      </form>
      <TableHeader />
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
                <td className="px-2 py-1">
                  <Button size="sm" variant="outline" onClick={() => handleDelete(u.id)}>
                    Supprimer
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
    </div>
  );
}
