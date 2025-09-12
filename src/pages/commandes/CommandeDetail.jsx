// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

import { useCommandes } from "@/hooks/useCommandes";
import { useTemplatesCommandes } from "@/hooks/useTemplatesCommandes";
import CommandePDF from "@/components/pdf/CommandePDF";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

async function generateCommandePDFBase64(commande, template, fournisseur) {
  const blob = await pdf(
    <CommandePDF commande={commande} template={template} fournisseur={fournisseur} />
  ).toBlob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

export default function CommandeDetail() {
  const { id } = useParams();
  const { currentCommande: commande, fetchCommandeById, loading } = useCommandes();
  const { getTemplateForFournisseur } = useTemplatesCommandes();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    fetchCommandeById(id);
  }, [id, fetchCommandeById]);

  useEffect(() => {
    if (commande?.fournisseur_id) {
      getTemplateForFournisseur(commande.fournisseur_id).then(({ data }) =>
      setTemplate(data || null)
      );
    }
  }, [commande, getTemplateForFournisseur]);

  if (loading || !commande) return <div>Chargement...</div>;

  const fournisseur = commande.fournisseur;

  const handleSendEmail = async () => {
    // En mode local, l'envoi direct par email n'est pas géré.
    try {
      await generateCommandePDFBase64(commande, template, fournisseur);
      toast.info("PDF généré : envoyez-le manuellement par votre client mail");
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Commande {commande.reference}</h1>
      <PDFDownloadLink
        document={<CommandePDF commande={commande} template={template} fournisseur={fournisseur} />}
        fileName={`commande-${commande.id}.pdf`}
        className="btn btn-sm bg-blue-600 text-white mt-3">

        {({ loading }) => loading ? "Préparation..." : "Télécharger PDF"}
      </PDFDownloadLink>
      <Button onClick={handleSendEmail} className="mt-2 bg-green-600 text-white">
        📩 Envoyer par email
      </Button>
    </div>);

}