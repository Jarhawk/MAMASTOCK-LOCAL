import { isTauri } from "@/lib/tauriEnv"; // src/hooks/useAuth.js
export function useAuth() {
  // Bypass complet : renvoie un "admin local" tout le temps.
  return {
    session: { user: { email: "admin@local" } },
    role: "admin",
    mama_id: "local",
    user: { email: "admin@local" },
    signOut: () => {},
    signIn: () => {}
  };
}
export default useAuth;