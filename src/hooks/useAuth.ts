import { AuthProvider, useAuth as useAuthContext } from "@/context/AuthContext";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type UseAuthReturn = ReturnType<typeof useAuthContext> & { status: AuthStatus };

export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();
  const hasUser = Boolean(ctx.user);
  const status: AuthStatus = ctx.loading
    ? "loading"
    : hasUser
      ? "authenticated"
      : "unauthenticated";

  const result: UseAuthReturn = { ...ctx, status };
  return result;
}

export { AuthProvider };

export default useAuth;
