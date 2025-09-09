import { initSchema } from "./index";

/**
 * Apply database migrations before booting the app.
 * Currently this simply ensures the base schema exists.
 */
export async function applyMigrations() {
  await initSchema();
}
