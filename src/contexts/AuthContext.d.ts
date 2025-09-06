declare module '@/contexts/AuthContext' {
  interface AuthContextValue {
    user: { email: string; role: string } | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    hasAccess: (module?: string | null, perm?: string | null) => boolean
  }
  export function useAuth(): AuthContextValue
  export const AuthProvider: React.ComponentType<React.PropsWithChildren<unknown>>
  export default AuthProvider
}
