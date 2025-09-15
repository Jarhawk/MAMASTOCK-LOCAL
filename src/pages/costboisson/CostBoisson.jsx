// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import GlassCard from "@/components/ui/GlassCard";
import PageWrapper from "@/components/ui/PageWrapper";import { isTauri } from "@/lib/db/sql";

export default function CostBoissons() {
  return (
    <PageWrapper>
      <GlassCard className="p-6 text-center">
        <p>La gestion du coût des boissons n'est pas disponible en mode hors connexion.</p>
      </GlassCard>
    </PageWrapper>);

}