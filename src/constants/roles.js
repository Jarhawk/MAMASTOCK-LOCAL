import { isTauri } from "@/lib/db/sql";export const DEFAULT_ROLES = [
{
  id: "chef_site",
  nom: "Chef de site",
  actif: true,
  access_rights: {
    fournisseurs: { lecture: true, creation: true, edition: true, suppression: true },
    factures: { lecture: true, creation: true, edition: true, suppression: true },
    fiches_techniques: { lecture: true, creation: true, edition: true, suppression: true },
    produits: { lecture: true, creation: true, edition: true, suppression: true },
    inventaires: { lecture: true, creation: true, edition: true, suppression: true },
    alertes: { lecture: true },
    menu_engineering: { lecture: true }
  }
},
{
  id: "superviseur",
  nom: "Superviseur",
  actif: true,
  access_rights: {
    analyse: { lecture: true },
    fournisseurs: { lecture: true },
    factures: { lecture: true },
    fiches_techniques: { lecture: true },
    produits: { lecture: true },
    inventaires: { lecture: true },
    alertes: { lecture: true },
    menu_engineering: { lecture: true }
  }
},
{
  id: "siege",
  nom: "Siège",
  actif: true,
  access_rights: {
    analyse: { lecture: true },
    parametrage: { lecture: true, creation: true, edition: true, suppression: true },
    fournisseurs: { lecture: true },
    factures: { lecture: true },
    fiches_techniques: { lecture: true },
    produits: { lecture: true },
    inventaires: { lecture: true },
    alertes: { lecture: true },
    menu_engineering: { lecture: true },
    roles: { lecture: true, creation: true, edition: true, suppression: true },
    utilisateurs: { lecture: true, creation: true, edition: true, suppression: true }
  }
}];