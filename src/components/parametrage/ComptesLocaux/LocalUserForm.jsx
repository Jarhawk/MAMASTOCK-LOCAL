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

function initialState() {
  return {
    email: "",
    password: "",
    confirm: "",
    role: "chef_site",
  };
}

export default function LocalUserForm({ open, onOpenChange, createUser, onCreated }) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(initialState());
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    const email = values.email.trim();
    if (!email) {
      nextErrors.email = "L'e-mail est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Format d'e-mail invalide.";
    }

    if (!values.password || values.password.length < 8) {
      nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!values.confirm) {
      nextErrors.confirm = "Merci de confirmer le mot de passe.";
    } else if (values.password !== values.confirm) {
      nextErrors.confirm = "La confirmation ne correspond pas.";
    }

    if (!values.role) {
      nextErrors.role = "Le rôle est obligatoire.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await createUser({
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      if (result?.success) {
        toast.success("Compte créé");
        onOpenChange?.(false);
        onCreated?.();
      } else {
        toast.error(result?.error || "Échec de la création du compte.");
      }
    } catch (err) {
      const message = err?.message || "Échec de la création du compte.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-gray-200 bg-white text-mamastock-text shadow-xl">
        <DialogHeader>
          <DialogTitle>Créer un compte local</DialogTitle>
          <DialogDescription>
            Renseignez les informations pour ajouter un utilisateur local.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <Label htmlFor="local-user-email">E-mail</Label>
            <Input
              id="local-user-email"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="exemple@domaine.fr"
              className="bg-white/10 text-mamastock-text placeholder:text-gray-500"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="local-user-password">Mot de passe</Label>
            <Input
              id="local-user-password"
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder="Minimum 8 caractères"
              className="bg-white/10 text-mamastock-text placeholder:text-gray-500"
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="local-user-confirm">Confirmer le mot de passe</Label>
            <Input
              id="local-user-confirm"
              type="password"
              value={values.confirm}
              onChange={handleChange("confirm")}
              className="bg-white/10 text-mamastock-text placeholder:text-gray-500"
              required
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
          </div>

          <div>
            <Label htmlFor="local-user-role">Rôle</Label>
            <Select
              value={values.role}
              onValueChange={(value) => setValues((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger id="local-user-role" className="bg-white text-mamastock-text">
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
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
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
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
