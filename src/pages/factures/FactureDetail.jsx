// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FactureForm from './FactureForm.jsx';
import { mapDbLineToUI } from '@/features/factures/invoiceMappers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { facture_get } from '@/lib/db';
import PiecesManager from "@/components/factures/PiecesManager";import { isTauri } from "@/lib/tauriEnv";

function toLabel(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return toLabel(v[0]);
  if (typeof v === 'object') return (
  v.nom ??
  v.name ??
  v.label ??
  v.code ??
  v.abbr ??
  v.abreviation ??
  v.symbol ??
  v.symbole ??
  v.id ??
  '') +
  '';
  return String(v);
}

export default function FactureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!isTauri()) {
        console.info('FactureDetail: ignoré hors Tauri');
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await facture_get(Number(id));
        if (data && isMounted) {
          setForm({
            id: data.id,
            fournisseur_id: data.fournisseur_id ?? null,
            date_facture: data.date_iso,
            numero: '',
            statut: 'Validée',
            total_ht_attendu: null
          });
          setLignes((data.lignes || []).map(mapDbLineToUI));
        }
      } catch (error) {
        toast.error(error?.message || 'Erreur de chargement de la facture');
      }

      if (isMounted) setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!isTauri()) {
    return <div className="p-6">Ouvrez l’app Tauri pour consulter cette facture.</div>;
  }

  if (loading) return <LoadingSpinner message="Chargement..." />;
  const selectedFactureId = id;
  return (
    <>
      <FactureForm
        initialForm={form}
        initialLignes={lignes}
        onClose={() => navigate(-1)}
        onSaved={() => navigate(-1)} />
      
      {selectedFactureId ?
      <PiecesManager factureId={selectedFactureId} /> :

      <div className="text-sm opacity-70">Sélectionne une facture pour voir les pièces jointes</div>
      }
    </>);

}

export { toLabel };