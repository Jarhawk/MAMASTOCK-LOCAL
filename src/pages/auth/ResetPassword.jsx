// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import GlassCard from "@/components/ui/GlassCard";
import PageWrapper from "@/components/ui/PageWrapper";import { isTauri } from "@/lib/runtime/isTauri";

export default function ResetPassword() {
  return (
    <PageWrapper>
      <GlassCard className="p-6 text-center">
        <p>La réinitialisation de mot de passe n'est pas disponible hors ligne. Contactez votre administrateur.</p>
      </GlassCard>
    </PageWrapper>);

}