import { isTauri, getDb } from "@/lib/sql";

(async () => {
  if (!isTauri) return;
  const db = await getDb();
  await db.execute("INSERT INTO fournisseurs (nom) VALUES (?)", ["SMOKE-FOO"]);
  const rows = await db.select("SELECT nom FROM fournisseurs WHERE nom LIKE ?", ["SMOKE-%"]);
  console.info("[dbSmoke] fournisseurs:", rows);
})();
