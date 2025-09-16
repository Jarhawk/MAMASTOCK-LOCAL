import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "manager", label: "Manager" },
  { value: "chef_site", label: "Chef de site" },
];

export default function ChangeRoleDialog({ open, onOpenChange, user, changeRole, onRoleUpdated }) {
  const [role, setRole] = useState("chef_site");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRole(user?.role || "chef_site");
      setError(null);
      setSubmitting(false);
    } else {
      setRole("chef_site");
      setError(null);
      setSubmitting(false);
    }
  }, [open, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!role) {
      setError("Le rôle est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await changeRole({
        id: user?.id ?? "",
        role,
      });
      if (result?.success) {
        toast.success("Rôle mis à jour");
        onOpenChange?.(false);
        onRoleUpdated?.();
      } else {
        toast.error(result?.error || "Échec de la mise à jour du rôle.");
      }
    } catch (err) {
      const message = err?.message || "Échec de la mise à jour du rôle.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-gray-200 bg-white text-mamastock-text shadow-xl">
        <DialogHeader>
          <DialogTitle>Changer le rôle</DialogTitle>
          <DialogDescription>
            Sélectionnez un nouveau rôle pour cet utilisateur local.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <Label htmlFor="change-role-email">E-mail</Label>
            <Input
              id="change-role-email"
              value={user?.email ?? ""}
              disabled
              className="bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="change-role-role">Rôle</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger id="change-role-role" className="bg-white text-mamastock-text">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent className="bg-white text-mamastock-text">
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              className="border border-gray-300 bg-transparent text-mamastock-text"
              onClick={() => onOpenChange?.(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-mamastockGold text-white" disabled={submitting}>
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
