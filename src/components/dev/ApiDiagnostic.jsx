import { query } from '@/local/db';import { isTauri } from "@/lib/tauriEnv";

export default function ApiDiagnostic({ mamaId }) {
  const test = async () => {
    console.log('[diag] mamaId', mamaId);

    console.log('[diag] mamas/logo_url');
    console.log(
      await query('SELECT logo_url FROM mamas WHERE id = ?', [mamaId])
    );

    console.log('[diag] fournisseurs');
    console.log(
      await query(
        'SELECT id, nom FROM fournisseurs WHERE mama_id = ? ORDER BY id LIMIT 3',
        [mamaId]
      )
    );

    console.log('[diag] ruptures');
    console.log(
      await query(
        'SELECT produit_id, nom, stock_actuel, stock_min, manque FROM v_alertes_rupture_api LIMIT 3'
      )
    );
  };

  return (
    <button onClick={test} style={{ padding: 8, borderRadius: 8 }}>
      Diagnostic API
    </button>);

}