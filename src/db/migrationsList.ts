import MIG_001 from "@/migrations/001_schema.sql?raw";
import MIG_002 from "@/migrations/002_seed.sql?raw";
import MIG_003 from "@/migrations/003_pmp_valeur_stock.sql?raw";

export const migrations = [
  { id: "001_schema", sql: MIG_001 },
  { id: "002_seed", sql: MIG_002 },
  { id: "003_pmp_valeur_stock", sql: MIG_003 },
];
