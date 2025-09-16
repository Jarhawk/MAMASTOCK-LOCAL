import { useMemo, useState } from "react";
import { toast } from "sonner";
import useLocalUsers from "@/hooks/useLocalUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocalUserForm from "@/components/parametrage/ComptesLocaux/LocalUserForm";
import ResetPasswordDialog from "@/components/parametrage/ComptesLocaux/ResetPasswordDialog";
import ChangeRoleDialog from "@/components/parametrage/ComptesLocaux/ChangeRoleDialog";

const ROLE_LABELS = {
  admin: "Administrateur",
  manager: "Manager",
  chef_site: "Chef de site",
};

const ROLE_COLORS = {
  admin: "red",
  manager: "blue",
  chef_site: "gold",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (error) {
    return "—";
  }
}

export default function ComptesLocaux() {
  const { data, loading, error, search, setSearch, page, setPage, pageSize, total, totalPages, refresh, actions } =
    useLocalUsers();
  const [showCreate, setShowCreate] = useState(false);
  const [userForReset, setUserForReset] = useState(null);
  const [userForRole, setUserForRole] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const paginationInfo = useMemo(() => {
    if (total === 0) {
      return { start: 0, end: 0, page: 1 };
    }
    const safePage = Math.min(Math.max(page, 1), totalPages || 1);
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(start + data.length - 1, total);
    return { start, end, page: safePage };
  }, [data.length, page, pageSize, total, totalPages]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const result = await actions.removeUser({ id: userToDelete.id });
      if (result?.success) {
        toast.success("Compte supprimé");
        setUserToDelete(null);
        await refresh();
      } else {
        toast.error(result?.error || "Échec de la suppression.");
      }
    } catch (err) {
      const message = err?.message || "Échec de la suppression.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-white">
      <div>
        <h1 className="text-2xl font-semibold">Comptes locaux</h1>
        <p className="text-sm text-white/70">
          Gérez les utilisateurs stockés localement sur cet appareil.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Label htmlFor="local-users-search" className="text-white">
              Recherche e-mail
            </Label>
            <Input
              id="local-users-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrer par e-mail"
              className="bg-white/10 text-white placeholder:text-white/70"
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowCreate(true)}
            className="self-start rounded-md bg-mamastockGold px-4 py-2 text-white shadow"
          >
            Nouveau compte
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/10 text-xs uppercase tracking-wide text-white/70">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Mama</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/70">
                    Chargement…
                  </td>
                </tr>
              )}

              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/70">
                    Aucun compte local trouvé.
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge color={ROLE_COLORS[user.role] || "gray"} ariaLabel={ROLE_LABELS[user.role] || user.role}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-white/80">{user.mama_id || "—"}</td>
                    <td className="px-4 py-3 text-white/80">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          className="rounded-md border border-white/20 bg-transparent px-3 py-1 text-xs text-white hover:bg-white/10"
                          onClick={() => setUserForRole(user)}
                        >
                          Changer rôle
                        </Button>
                        <Button
                          type="button"
                          className="rounded-md border border-white/20 bg-transparent px-3 py-1 text-xs text-white hover:bg-white/10"
                          onClick={() => setUserForReset(user)}
                        >
                          Réinitialiser MDP
                        </Button>
                        <Button
                          type="button"
                          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-100 hover:bg-red-500/20"
                          onClick={() => setUserToDelete(user)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {paginationInfo.start}-{paginationInfo.end} / {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={loading || total === 0 || page <= 1}
              className="rounded-md border border-white/20 bg-transparent px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
            >
              Précédent
            </Button>
            <span className="text-xs text-white/60">
              Page {paginationInfo.page} / {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={loading || total === 0 || page >= totalPages}
              className="rounded-md border border-white/20 bg-transparent px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      <LocalUserForm
        open={showCreate}
        onOpenChange={setShowCreate}
        createUser={actions.createUser}
        onCreated={refresh}
      />

      <ResetPasswordDialog
        open={Boolean(userForReset)}
        onOpenChange={(next) => {
          if (!next) setUserForReset(null);
        }}
        user={userForReset}
        resetPassword={actions.resetPassword}
        onReset={refresh}
      />

      <ChangeRoleDialog
        open={Boolean(userForRole)}
        onOpenChange={(next) => {
          if (!next) setUserForRole(null);
        }}
        user={userForRole}
        changeRole={actions.changeRole}
        onRoleUpdated={refresh}
      />

      <Dialog open={Boolean(userToDelete)} onOpenChange={(next) => (!next ? setUserToDelete(null) : null)}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white text-mamastock-text shadow-xl">
          <DialogHeader>
            <DialogTitle>Supprimer le compte ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. L'utilisateur ne pourra plus se connecter avec ce compte local.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 p-4">
            <p>
              Confirmez-vous la suppression de <span className="font-semibold">{userToDelete?.email}</span> ?
            </p>
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
            <Button
              type="button"
              className="border border-gray-300 bg-transparent text-mamastock-text"
              onClick={() => setUserToDelete(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
