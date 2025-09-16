import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createAsyncState } from './_shared/createAsyncState';
import { emails_envoyes_list } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

export function useEmailsEnvoyes() {
  const { mama_id } = useAuth();
  const [state, setState] = useState(() => createAsyncState([]));

  async function fetchEmails({
    statut,
    email,
    commande_id,
    date_start,
    date_end,
    page = 1,
    limit = 50
  } = {}) {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (!mama_id) {
        setState({ data: [], loading: false, error: null });
        return { count: 0 };
      }
      const p = Number(page) || 1;
      const l = Number(limit) || 50;
      const offset = (p - 1) * l;
      const { rows, count } = await emails_envoyes_list(mama_id, {
        statut,
        email,
        commande_id,
        date_start,
        date_end,
        limit: l,
        offset
      });
      setState({ data: rows || [], loading: false, error: null });
      return { count };
    } catch (e) {
      setState({ data: [], loading: false, error: e });
      throw e;
    }
  }

  async function resendEmail() {
    return { error: new Error('Fonction non disponible hors ligne') };
  }

  return {
    fetchEmails,
    emails: state.data,
    loading: state.loading,
    error: state.error,
    resendEmail
  };
}

export default useEmailsEnvoyes;