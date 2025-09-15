// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import GlassCard from "@/components/ui/GlassCard";
import PageWrapper from "@/components/ui/PageWrapper";import { isTauri } from "@/lib/runtime/isTauri";

export default function BarManager() {
  return (
    <PageWrapper>
      <GlassCard className="p-6 text-center">
        <p>Le module Bar Manager n'est pas disponible en mode hors connexion.</p>
      </GlassCard>
    </PageWrapper>);

}