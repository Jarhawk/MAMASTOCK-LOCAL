// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import { onboarding_fetch, onboarding_start } from "@/lib/db";import { isTauri } from "@/lib/tauriEnv";

export default function useOnboarding() {
  const { mama_id, user } = useAuth();
  const user_id = user?.id;

  async function fetchProgress() {
    if (!user_id || !mama_id) return null;
    if (!isTauri()) {
      console.info("useOnboarding: ignoré hors Tauri");
      return null;
    }
    return onboarding_fetch(user_id, mama_id);
  }

  async function startOnboarding() {
    if (!user_id || !mama_id) return;
    if (!isTauri()) {
      console.info("useOnboarding: start ignoré hors Tauri");
      return;
    }
    await onboarding_start(user_id, mama_id);
  }

  return { fetchProgress, startOnboarding };
}