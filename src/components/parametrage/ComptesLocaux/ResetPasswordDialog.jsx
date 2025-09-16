import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordDialog({ open, onOpenChange, user, resetPassword, onReset }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirm("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open, user?.email]);

  const validate = () => {
    const nextErrors = {};
    if (!password || password.length < 8) {
      nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!confirm) {
      nextErrors.confirm = "Merci de confirmer le mot de passe.";
    } else if (password !== confirm) {
      nextErrors.confirm = "La confirmation ne correspond pas.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await resetPassword({
        email: user?.email ?? "",
        newPassword: password,
      });
      if (result?.success) {
        toast.success("Mot de passe réinitialisé");
        onOpenChange?.(false);
        onReset?.();
      } else {
        toast.error(result?.error || "Échec de la réinitialisation.");
      }
    } catch (err) {
      const message = err?.message || "Échec de la réinitialisation.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-gray-200 bg-white text-mamastock-text shadow-xl">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Définissez un nouveau mot de passe pour cet utilisateur local.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <Label htmlFor="reset-user-email">E-mail</Label>
            <Input
              id="reset-user-email"
              value={user?.email ?? ""}
              disabled
              className="bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="reset-user-password">Nouveau mot de passe</Label>
            <Input
              id="reset-user-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 caractères"
              className="bg-white/10 text-mamastock-text placeholder:text-gray-500"
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="reset-user-confirm">Confirmer</Label>
            <Input
              id="reset-user-confirm"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="bg-white/10 text-mamastock-text placeholder:text-gray-500"
              required
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
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
              Réinitialiser
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
