import {
  AuthProvider,
  useAuth as useAuthContext
} from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type SessionPayload = { user: NonNullable<User> };
type UseAuthReturn = ReturnType<typeof useAuthContext> & {
  status: AuthStatus;
  session: SessionPayload | null;
  user_id: string | null;
};

export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();
  const hasUser = Boolean(ctx.user);
  const status: AuthStatus = ctx.loading
    ? "loading"
    : hasUser
      ? "authenticated"
      : "unauthenticated";

  const baseUser = (ctx.userData ?? ctx.user) as NonNullable<User> | null;
  const session: SessionPayload | null = baseUser
    ? { user: baseUser }
    : null;
  const user_id = baseUser?.id ?? ctx.id ?? null;

  const result: UseAuthReturn = {
    ...ctx,
    status,
    session,
    user_id
  };
  return result;
}

export { AuthProvider };

export default useAuth;
