import { useEffect, useState } from "react";

import { loadConfig, saveDbUrl } from "@/local/config";
import { devFlags } from "@/lib/devFlags";
import "@/pages/login.css";

export default function FirstRunDb() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Configuration PostgreSQL • MamaStock";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadConfig()
      .then(({ dbUrl }) => {
        if (!cancelled && dbUrl) {
          setUrl(dbUrl);
        }
      })
      .catch((err) => {
        console.error("[setup] Lecture config échouée", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    const normalized = url.trim();
    if (!normalized || !normalized.toLowerCase().startsWith("postgres")) {
      setError("Veuillez entrer une URL PostgreSQL valide (postgresql://…)");
      return;
    }
    setSaving(true);
    try {
      await saveDbUrl(normalized);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error("[setup] Impossible d'enregistrer l'URL", err);
      setError("Impossible d'enregistrer cette URL. Veuillez réessayer.");
      setSaving(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <img
          src="/android-chrome-512x512.png"
          alt="MamaStock"
          className="login-logo"
          width={72}
          height={72}
        />
        <h1 className="login-title">Connexion à la base PostgreSQL</h1>
        <p className="login-subtitle">
          Indiquez l'URL fournie par Neon (format postgresql://…)
        </p>
        {error ? <div className="login-error">{error}</div> : null}
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="db-url">
            Chaîne de connexion
          </label>
          <input
            id="db-url"
            className="login-input"
            type="text"
            placeholder="postgresql://user:pass@host/db?sslmode=require"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoComplete="off"
            autoFocus
            required
          />
          <button type="submit" className="login-btn" disabled={saving}>
            {saving ? "Enregistrement…" : "Valider et redémarrer"}
          </button>
        </form>
        <p className="login-helper">
          L'URL est stockée dans le dossier de configuration Tauri ({
            devFlags.isTauri ? "AppData" : "profil"
          }).
        </p>
      </div>
    </div>
  );
}
