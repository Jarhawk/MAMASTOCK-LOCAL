// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { exec } from '@/local/db';

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export function useAuditLog() {
  const { mama_id, user } = useAuth();

  async function log(action, details = null) {
    if (!mama_id) return;
    await exec(
      `INSERT INTO journaux_utilisateur(mama_id, user_id, action, details, done_by)
       VALUES(?, ?, ?, ?, ?)`,
      [mama_id, user?.id || null, action, details, user?.id || null]
    );
  }

  async function logSecurityEvent({ type, user_id = null, description = "" }) {
    if (!mama_id) return;
    const ip = window?.location?.hostname || null;
    const navigateur = navigator.userAgent;
    await exec(
      `INSERT INTO logs_securite(mama_id, type, user_id, ip, navigateur, description)
       VALUES(?, ?, ?, ?, ?, ?)`,
      [mama_id, type, user_id || user?.id || null, ip, navigateur, description]
    );
  }

  return { log, logSecurityEvent };
}