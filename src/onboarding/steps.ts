import { getMeta, setMeta } from "@/db/connection";
import { getDb } from "@/lib/db/sql";
import { isTauri } from "@/lib/tauriEnv";

export type Step = {
  id: string;
  title: string;
  description?: string;
  ensure: () => Promise<void>;
  isDone: () => Promise<boolean>;
};

export async function hasAny(table: string) {
  if (!isTauri()) {
    console.log(`onboarding/steps: ${table} ignoré hors Tauri`);
    return false;
  }
  const db = await getDb();
  const r = await db.select<{ n: number }[]>(
    `SELECT COUNT(1) as n FROM ${table} LIMIT 1`,
  );
  return (r?.[0]?.n ?? 0) > 0;
}

export const steps: Step[] = [
  {
    id: "mama",
    title: "Créer votre établissement",
    description: "Renseignez le nom de l’établissement.",
    ensure: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:mama ignoré hors Tauri");
        return;
      }
      const db = await getDb();
      await db.execute(`
        INSERT INTO mama (id, nom)
        SELECT 'local', 'MamaStock Local'
        WHERE NOT EXISTS (SELECT 1 FROM mama LIMIT 1);
      `);
    },
    isDone: async () => hasAny("mama"),
  },
  {
    id: "unites",
    title: "Unités par défaut",
    description: "Ajout des unités g, kg, ml, L, pièce si absentes.",
    ensure: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:unites ignoré hors Tauri");
        return;
      }
      const db = await getDb();
      await db.execute(`
        INSERT INTO unites (code, libelle) VALUES
          ('g','Gramme'), ('kg','Kilogramme'),
          ('ml','Millilitre'), ('L','Litre'),
          ('pc','Pièce')
        ON CONFLICT(code) DO NOTHING;
      `);
    },
    isDone: async () => hasAny("unites"),
  },
  {
    id: "familles",
    title: "Familles & sous-familles",
    description: "Crée une famille par défaut si rien n’existe.",
    ensure: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:familles ignoré hors Tauri");
        return;
      }
      const db = await getDb();
      await db.execute(`
        INSERT INTO familles (code, libelle)
        SELECT 'GEN', 'Général'
        WHERE NOT EXISTS (SELECT 1 FROM familles);

        INSERT INTO sous_familles (code, libelle, famille_code)
        SELECT 'GEN-STD', 'Standard', 'GEN'
        WHERE NOT EXISTS (SELECT 1 FROM sous_familles);
      `);
    },
    isDone: async () => hasAny("familles"),
  },
  {
    id: "fournisseurs",
    title: "Fournisseurs",
    description: "Ajoute un fournisseur générique.",
    ensure: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:fournisseurs ignoré hors Tauri");
        return;
      }
      const db = await getDb();
      await db.execute(`
        INSERT INTO fournisseurs (nom)
        SELECT 'Fournisseur Local'
        WHERE NOT EXISTS (SELECT 1 FROM fournisseurs);
      `);
    },
    isDone: async () => hasAny("fournisseurs"),
  },
  {
    id: "flag",
    title: "Terminer",
    description: "Marque l’onboarding comme terminé.",
    ensure: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:flag ignoré hors Tauri");
        return;
      }
      await setMeta("onboarded", "1");
    },
    isDone: async () => {
      if (!isTauri()) {
        console.log("onboarding/steps:flag isDone ignoré hors Tauri");
        return false;
      }
      return (await getMeta("onboarded")) === "1";
    },
  },
];
