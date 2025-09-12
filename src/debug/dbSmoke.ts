import { select, run, tx } from "@/lib/sql";

(async () => {
  await tx(async () => {
    await run("INSERT INTO fournisseurs (nom) VALUES (?)", ["SMOKE-FOO"]);
  });
  const rows = await select("SELECT nom FROM fournisseurs WHERE nom LIKE ?", ["SMOKE-%"]);
  console.info("[dbSmoke] fournisseurs:", rows);
})();
