import useAuth from "./hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { loading, user, devFakeAuth } = useAuth();

  if (loading) {
    return (
      <div className="p-6 text-sm text-zinc-500">
        Chargement de votre session...
      </div>
    );
  }

  if (!user && !devFakeAuth) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-lg font-semibold">Connexion requise</div>
        <p className="text-sm text-zinc-600">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return children;
}
