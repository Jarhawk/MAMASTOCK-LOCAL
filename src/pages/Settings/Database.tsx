import { useEffect, useState } from "react";
import Database from "@tauri-apps/plugin-sql";

import { readConfig, writeConfig } from "@/lib/db";
import { isTauri } from "@/lib/tauriEnv";

type Driver = "sqlite" | "postgres";

export default function DatabaseSettings() {
  const [driver, setDriver] = useState<Driver>("postgres");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const cfg = await readConfig();
        if (!mounted) return;
        setDriver(cfg.database.driver);
        setUrl(cfg.database.url);
      } catch (error) {
        console.error("[settings:db] unable to read config", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function testConnection() {
    if (!isTauri()) {
      alert("Test de connexion disponible uniquement dans l'application Tauri.");
      return;
    }

    try {
      const db = await Database.load(url);
      await db.select(driver === "postgres" ? "SELECT 1" : "SELECT 1");
      alert("Connexion OK ✅");
    } catch (error: any) {
      alert(`Erreur connexion ❌\n${error?.message || error}`);
    }
  }

  async function save() {
    await writeConfig({ database: { driver, url } });
    alert("Configuration enregistrée.");
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement…</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Paramètres — Base de données</h2>
      <label>Driver</label>
      <br />
      <select value={driver} onChange={(event) => setDriver(event.target.value as Driver)}>
        <option value="postgres">PostgreSQL (Neon)</option>
        <option value="sqlite">SQLite (local)</option>
      </select>

      <div style={{ height: 12 }} />

      <label>URL de connexion</label>
      <br />
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        style={{ width: "100%" }}
        placeholder="postgresql://user:pass@host/db?sslmode=require"
      />

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={testConnection}>Tester la connexion</button>
        <button onClick={save}>Enregistrer</button>
      </div>
      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        Astuce: Neon requiert <code>sslmode=require</code> (déjà présent).
      </p>
    </div>
  );
}
