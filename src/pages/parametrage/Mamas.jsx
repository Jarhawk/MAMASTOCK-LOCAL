// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useMamas } from '@/hooks/useMamas';
import { Button } from '@/components/ui/button';
import TableContainer from '@/components/ui/TableContainer';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription } from
'@/components/ui/SmartDialog';
import MamaForm from './MamaForm';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';import { isTauri } from "@/lib/tauriEnv";

export default function Mamas() {
  const { mama_id: myMama, role } = useAuth();
  const {
    mamas,
    loading,
    fetchMamas,
    toggleMamaActive,
    addMama,
    updateMama
  } = useMamas();
  const [search, setSearch] = useState('');
  const [editMama, setEditMama] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchMamas();
  }, []);

  const handleToggleActive = async (id, actif) => {
    if (role !== 'superadmin' && id !== myMama) {
      toast.error('Action non autorisée');
      return;
    }
    const res = await toggleMamaActive(id, actif);
    if (!res?.error) {
      toast.success(
        actif ? 'Établissement réactivé.' : 'Établissement désactivé.'
      );
    } else {
      toast.error(res.error || 'Erreur lors de la mise à jour.');
    }
    setConfirmId(null);
  };

  const filtered = mamas.filter(
    (m) =>
    m.nom?.toLowerCase().includes(search.toLowerCase()) ||
    m.ville?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto text-shadow">
            <h1 className="text-2xl font-bold mb-4">Établissements (MAMA)</h1>
      <div className="flex gap-4 mb-4 items-end">
        <input
          className="input input-bordered w-64"
          placeholder="Recherche nom, ville"
          value={search}
          onChange={(e) => setSearch(e.target.value)} />

        {role === 'superadmin' &&
        <Button
          onClick={() => setEditMama({ nom: '', ville: '', actif: true })}>
          
            + Nouvel établissement
          </Button>
        }
      </div>
      <TableContainer className="mb-6">
        {loading ?
        <LoadingSpinner message="Chargement…" /> :

        <table className="min-w-full table-auto text-center">
            <thead>
              <tr>
                <th className="px-2 py-1">Nom</th>
                <th className="px-2 py-1">Ville</th>
                <th className="px-2 py-1">Actif</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) =>
            <tr key={m.id}>
                  <td className="px-2 py-1">{m.nom}</td>
                  <td className="px-2 py-1">{m.ville}</td>
                  <td className="px-2 py-1">
                    <span
                  className={
                  m.actif ?
                  'inline-block bg-green-100 text-green-800 px-2 rounded-full' :
                  'inline-block bg-red-100 text-red-800 px-2 rounded-full'
                  }>

                      {m.actif ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-2 py-1 flex items-center justify-center gap-2">
                    <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditMama(m)}
                  disabled={
                  loading || role !== 'superadmin' && m.id !== myMama
                  }>

                      Éditer
                    </Button>
                    {confirmId === m.id ?
                <>
                        <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleToggleActive(m.id, !m.actif)}
                    disabled={
                    loading ||
                    role !== 'superadmin' && m.id !== myMama
                    }>

                          Confirmer
                        </Button>
                        <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmId(null)}
                    disabled={loading}>

                          Annuler
                        </Button>
                      </> :

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmId(m.id)}
                  disabled={
                  loading || role !== 'superadmin' && m.id !== myMama
                  }>

                        {m.actif ? 'Désactiver' : 'Activer'}
                      </Button>
                }
                  </td>
                </tr>
            )}
              {filtered.length === 0 &&
            <tr>
                  <td colSpan={4} className="py-4 text-gray-400">
                    Aucun établissement trouvé.
                  </td>
                </tr>
            }
            </tbody>
          </table>
        }
      </TableContainer>
      <Dialog open={!!editMama} onOpenChange={(v) => !v && setEditMama(null)}>
        <DialogContent className="bg-white/10 backdrop-blur-lg text-white rounded-xl shadow-lg p-6 max-w-md">
          <DialogTitle className="font-bold mb-2">
            {editMama?.id ? "Modifier l'établissement" : 'Nouvel établissement'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire établissement
          </DialogDescription>
          <MamaForm
            mama={editMama}
            mamas={mamas}
            addMama={addMama}
            updateMama={updateMama}
            onSaved={() => {
              fetchMamas();
              setEditMama(null);
            }}
            onClose={() => setEditMama(null)} />
          

        </DialogContent>
      </Dialog>
    </div>);

}