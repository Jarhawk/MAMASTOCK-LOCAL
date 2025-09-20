import { AuthProvider, useAuth as useAuthContext } from "@/context/AuthContext";

type AuthStatus = "loading" | "authed" | "signedout";
type BaseAuthContext = ReturnType<typeof useAuthContext>;
type UseAuthReturn = BaseAuthContext & {
  status: AuthStatus;
  login: BaseAuthContext["signIn"];
};

export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();
  const status: AuthStatus = ctx.loading
    ? "loading"
    : ctx.user || ctx.devFakeAuth
      ? "authed"
      : "signedout";

  const result: UseAuthReturn = { ...ctx, status, login: ctx.signIn };
  return result;
}

export { AuthProvider };

export default useAuth;
