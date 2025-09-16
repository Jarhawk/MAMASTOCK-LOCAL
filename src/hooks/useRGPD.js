// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import { getUserLocal, deleteUserLocal } from '@/auth/localAccount';import { isTauri } from "@/lib/tauriEnv";

export function useRGPD() {
  const { id, role } = useAuth();

  async function getUserDataExport(userId = id) {
    if (!userId) return null;
    const profil = await getUserLocal(userId);
    return { profil, logs: [] };
  }

  async function purgeUserData(userId) {
    if (role !== 'superadmin') return { error: 'not allowed' };
    await deleteUserLocal(userId);
    return { success: true };
  }

  return { getUserDataExport, purgeUserData };
}