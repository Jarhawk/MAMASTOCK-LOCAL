import useAuth from "../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <p className="text-sm text-gray-500">
        {user?.email ? `Connecté en tant que ${user.email}.` : "Aucun utilisateur connecté."}
      </p>
    </div>
  );
}
