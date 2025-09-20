export type NavItem = {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  require?: string[];
  hide?: boolean;
};

export const SIDEBAR: NavItem[] = [
  { label: "Accueil", path: "/accueil", icon: "home" },
  { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  {
    label: "Produits",
    path: "/produits",
    icon: "package-search",
  },
  {
    label: "Fournisseurs",
    path: "/fournisseurs",
    icon: "truck",
  },
  {
    label: "Factures",
    path: "/factures",
    icon: "file-text",
  },
  {
    label: "Menus",
    path: "/menus",
    icon: "utensils-crossed",
    children: [
      { label: "Menu du jour", path: "/menus/jour" },
      { label: "Recettes", path: "/recettes" },
      { label: "Fiches techniques", path: "/recettes/fiches" },
    ],
  },
  {
    label: "Coûts",
    path: "/couts",
    icon: "piggy-bank",
    children: [
      { label: "Nourriture", path: "/couts/nourriture" },
      { label: "Boisson", path: "/couts/boisson" },
    ],
  },
  {
    label: "Inventaire",
    path: "/inventaires",
    icon: "boxes",
    children: [
      { label: "Inventaires", path: "/inventaires" },
      { label: "Zones d’inventaire", path: "/inventaires/zones" },
      { label: "Réquisitions", path: "/requisitions" },
    ],
  },
  {
    label: "Achats recommandés",
    path: "/achats-recommandes",
    icon: "shopping-cart",
  },
  {
    label: "Tâches",
    path: "/taches",
    icon: "list-checks",
  },
  {
    label: "Paramétrage",
    path: "/parametrage",
    icon: "settings",
    children: [
      { label: "Familles", path: "/parametrage/familles" },
      { label: "Sous-familles", path: "/parametrage/sous-familles" },
      { label: "Unités", path: "/parametrage/unites" },
      { label: "Dossier données", path: "/parametrage/dossier-donnees" },
      { label: "Onboarding", path: "/parametrage/onboarding", hide: true },
      { label: "Aide", path: "/aide", hide: true },
    ],
  },
];
