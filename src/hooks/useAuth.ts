import { AuthProvider, useAuth as useAuthContext } from "@/context/AuthContext";

type AuthStatus = "loading" | "authed" | "signedout";
type UseAuthReturn = ReturnType<typeof useAuthContext> & { status: AuthStatus };

export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();
  const status: AuthStatus = ctx.loading
    ? "loading"
    : ctx.user || ctx.devFakeAuth
      ? "authed"
      : "signedout";

  const result: UseAuthReturn = { ...ctx, status };
  return result;
}

export { AuthProvider };

export default useAuth;
