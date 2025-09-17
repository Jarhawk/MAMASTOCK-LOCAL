import { useEffect, useState } from "react";
import Database from "@tauri-apps/plugin-sql";

import { devFlags } from "@/lib/devFlags";
import { getConfigFilePath, getDbUrl, savePostgresUrl } from "@/lib/appConfig";
import { normalizePgUrl } from "@/lib/db/pg";
import { log } from "@/tauriLog";

import "@/pages/login.css";

const DEFAULT_HINT = "postgresql://user:pass@ep-neon.eu-west.neon.tech/neondb?sslmode=require";

export default function DbSetup({ initialError = "" } = {}) {
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);
  const [testMessage, setTestMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [configPath, setConfigPath] = useState("");
  const [hasSslRequire, setHasSslRequire] = useState(true);
  const [removedChannelBinding, setRemovedChannelBinding] = useState(false);

  const isRecovery = Boolean(initialError);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    let cancelled = false;
    getDbUrl()
      .then((value) => {
        if (!cancelled && value) {
          setUrl(value);
        }
      })
      .catch((err) => {
        console.warn("[setup] Impossible de lire la configuration", err);
      });
    if (devFlags.isTauri) {
      getConfigFilePath()
        .then((path) => {
          if (!cancelled && path) setConfigPath(path);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedPreview = url ? normalizePgUrl(url) : null;

  useEffect(() => {
    if (!normalizedPreview) {
      setHasSslRequire(true);
      setRemovedChannelBinding(false);
      return;
    }
    setHasSslRequire(normalizedPreview.hasSslRequire);
    setRemovedChannelBinding(normalizedPreview.removedChannelBinding);
  }, [normalizedPreview?.hasSslRequire, normalizedPreview?.removedChannelBinding]);

  const handleTest = async () => {
    if (testing) return;
    const candidate = url.trim();
    setError("");
    setTestMessage("");
    setInfoMessage("");
    if (!candidate || !candidate.toLowerCase().startsWith("postgres")) {
      setError("Veuillez entrer une URL PostgreSQL valide (postgresql://…)");
      return;
    }
    setTesting(true);
    try {
      const normalized = normalizePgUrl(candidate);
      setHasSslRequire(normalized.hasSslRequire);
      setRemovedChannelBinding(normalized.removedChannelBinding);
      const db = await Database.load(normalized.url);
      try {
        await db.select("SELECT 1");
      } finally {
        if (typeof db.close === "function") {
          try {
            await db.close();
          } catch {}
        }
      }
      setTestMessage("Connexion PostgreSQL réussie.");
      const infos = [];
      if (normalized.removedChannelBinding) {
        infos.push("Le paramètre channel_binding=require a été ignoré.");
      }
      if (!normalized.hasSslRequire) {
        infos.push("Ajoutez sslmode=require pour Neon (obligatoire).");
      }
      setInfoMessage(infos.join(" "));
      log.info("[setup] Test connexion PostgreSQL réussi");
    } catch (err) {
      const message = err?.message ?? String(err);
      log.error("[setup] Test connexion PostgreSQL échoué", err);
      setError(`Échec du test de connexion : ${message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const candidate = url.trim();
    setError("");
    setTestMessage("");
    setInfoMessage("");
    if (!candidate || !candidate.toLowerCase().startsWith("postgres")) {
      setError("Veuillez entrer une URL PostgreSQL valide (postgresql://…)");
      return;
    }
    setSaving(true);
    try {
      const normalized = normalizePgUrl(candidate);
      await savePostgresUrl(normalized.url);
      log.info("[setup] URL PostgreSQL enregistrée");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      const message = err?.message ?? String(err);
      log.error("[setup] Impossible d'enregistrer l'URL PostgreSQL", err);
      setError(`Impossible d'enregistrer cette URL : ${message}`);
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
        <h1 className="login-title">
          {isRecovery
            ? "Reconnexion à la base PostgreSQL"
            : "Configuration PostgreSQL"}
        </h1>
        <p className="login-subtitle">
          Indiquez l'URL fournie par Neon (format postgresql://…)
        </p>
        {error ? <div className="login-error">{error}</div> : null}
        {testMessage ? (
          <div className="login-helper" style={{ color: "#047857" }}>
            {testMessage}
          </div>
        ) : null}
        {infoMessage ? (
          <div className="login-helper" style={{ color: "#1d4ed8" }}>
            {infoMessage}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="db-url">
            Chaîne de connexion
          </label>
          <input
            id="db-url"
            className="login-input"
            type="text"
            placeholder={DEFAULT_HINT}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoComplete="off"
            autoFocus
          />
          <div className="login-hint">
            {removedChannelBinding
              ? "channel_binding=require a été retiré automatiquement."
              : ""}
            {!hasSslRequire
              ? " Veillez à conserver sslmode=require pour sécuriser la connexion."
              : ""}
          </div>
          <button
            type="button"
            className="login-btn secondary"
            onClick={handleTest}
            disabled={testing || saving}
          >
            {testing ? "Test en cours…" : "Tester la connexion"}
          </button>
          <button type="submit" className="login-btn" disabled={saving || testing}>
            {saving ? "Enregistrement…" : "Enregistrer et redémarrer"}
          </button>
        </form>
        <p className="login-helper">
          {configPath
            ? `Le fichier est enregistré dans ${configPath}.`
            : "Le fichier est stocké dans le dossier de configuration Tauri."}
          {" "}
          {devFlags.isTauri
            ? "L’application va redémarrer après l’enregistrement."
            : "Cette étape nécessite l’application Tauri."}
        </p>
      </div>
    </div>
  );
}
