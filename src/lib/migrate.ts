import { readDir, readTextFile } from "@tauri-apps/plugin-fs";

export async function migratePostgres(db: any) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const dir = "migrations/postgres";
  let entries: Array<{ name?: string }> = [];
  try {
    entries = await readDir(dir, { recursive: false });
  } catch {
    return;
  }

  const files = entries
    .filter((entry) => entry.name?.endsWith(".sql"))
    .map((entry) => entry.name as string)
    .sort();

  for (const name of files) {
    const seen = await db.select("SELECT 1 FROM __migrations WHERE name = $1", [name]);
    if (seen.length) continue;

    const sql = await readTextFile(`${dir}/${name}`);
    if (sql.trim()) {
      await db.execute(sql);
    }

    await db.execute("INSERT INTO __migrations(name) VALUES ($1)", [name]);
  }
}
