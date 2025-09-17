import { getDbUrl, savePostgresUrl } from "@/lib/appConfig";

export type AppConfig = { dbUrl: string | null };

export async function loadConfig(): Promise<AppConfig> {
  const dbUrl = await getDbUrl();
  return { dbUrl };
}

export async function saveDbUrl(url: string) {
  await savePostgresUrl(url);
}
