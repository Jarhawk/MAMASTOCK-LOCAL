import useAuth from "./hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6 text-sm text-zinc-500">
        Chargement de votre session…
      </div>
    );
  }

  if (status === "signedout") {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold text-zinc-900">Connexion requise</div>
        <p className="mt-3 max-w-md text-sm text-zinc-600">
          Vous devez être connecté pour accéder à ce contenu MamaStock.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
