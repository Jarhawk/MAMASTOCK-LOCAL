import useAuth from "./hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6 text-sm text-foreground/60">
        Chargement de votre session…
      </div>
    );
  }

  if (status === "signedout") {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6">
        <div className="text-center text-base font-medium text-foreground/80">
          Veuillez vous connecter pour accéder à ce contenu.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
