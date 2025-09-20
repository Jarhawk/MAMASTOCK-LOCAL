import { useEffect, useState } from "react";
import Database from "@tauri-apps/plugin-sql";

import { devFlags } from "@/lib/devFlags";
import { getConfigFilePath, getDbUrl, saveDbUrl } from "@/lib/appConfig";
import { getDbPath } from "@/lib/paths";
import { log } from "@/tauriLog";

import "@/pages/login.css";

const DEFAULT_HINT = "sqlite:mamastock.db";

export default function DbSetup({ initialError = "" } = {}) {
  const [url, setUrl] = useState("");
  const [defaultSqliteUrl, setDefaultSqliteUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);
  const [testMessage, setTestMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [configPath, setConfigPath] = useState("");

  const isRecovery = Boolean(initialError);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await getDbUrl();
        if (!cancelled && stored) {
          setUrl(stored);
        }
      } catch (err) {
        console.warn("[setup] Impossible de lire la configuration", err);
      }

      if (devFlags.isTauri) {
        getConfigFilePath()
          .then((path) => {
            if (!cancelled && path) setConfigPath(path);
          })
          .catch(() => {});

        try {
          const path = await getDbPath();
          if (cancelled) return;
          setLocalPath(path);
          const sqliteUrl = path?.trim() ? `sqlite:${path}` : "";
          setDefaultSqliteUrl(sqliteUrl);
          setUrl((prev) => {
            if (prev && prev.trim()) return prev;
            return sqliteUrl || prev;
          });
        } catch (err) {
          if (!cancelled) {
            console.warn("[setup] Impossible de récupérer le chemin SQLite local", err);
          }
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const effectivePlaceholder = defaultSqliteUrl || DEFAULT_HINT;

  const resolveCandidate = () => {
    const candidate = url.trim();
    if (candidate) return candidate;
    if (defaultSqliteUrl && defaultSqliteUrl.trim()) return defaultSqliteUrl.trim();
    return "";
  };

  const updateInfoMessage = (candidate) => {
    if (localPath && candidate === defaultSqliteUrl && localPath.trim()) {
      setInfoMessage(`Base locale située dans ${localPath}.`);
      return;
    }
    const path = candidate.replace(/^sqlite:/i, "");
    if (path) {
      setInfoMessage(`Chemin utilisé : ${path}`);
    }
  };

  const handleTest = async () => {
    if (testing) return;
    const candidate = resolveCandidate();
    setError("");
    setTestMessage("");
    setInfoMessage("");
    if (!candidate || !candidate.toLowerCase().startsWith("sqlite:")) {
      setError("Veuillez utiliser une URL SQLite valide (sqlite:…).");
      return;
    }
    setTesting(true);
    try {
      const db = await Database.load(candidate);
      try {
        await db.select("SELECT 1");
      } finally {
        if (typeof db.close === "function") {
          try {
            await db.close();
          } catch {}
        }
      }
      setTestMessage("Connexion SQLite réussie.");
      updateInfoMessage(candidate);
      log.info("[setup] Test connexion SQLite réussi");
    } catch (err) {
      const message = err?.message ?? String(err);
      log.error("[setup] Test connexion SQLite échoué", err);
      setError(`Échec du test de connexion : ${message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const candidate = resolveCandidate();
    setError("");
    setTestMessage("");
    setInfoMessage("");
    if (!candidate || !candidate.toLowerCase().startsWith("sqlite:")) {
      setError("Veuillez utiliser une URL SQLite valide (sqlite:…).");
      return;
    }
    setSaving(true);
    try {
      await saveDbUrl(candidate);
      log.info("[setup] URL SQLite enregistrée");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      const message = err?.message ?? String(err);
      log.error("[setup] Impossible d'enregistrer l'URL SQLite", err);
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
          {isRecovery ? "Reconnexion à la base locale" : "Configuration de la base locale"}
        </h1>
        <p className="login-subtitle">
          MamaStock fonctionne désormais avec une base SQLite stockée sur cette machine.
          Vérifiez ou ajustez le chemin ci-dessous.
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
            Chaîne de connexion SQLite
          </label>
          <input
            id="db-url"
            className="login-input"
            type="text"
            placeholder={effectivePlaceholder}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoComplete="off"
            autoFocus
          />
          <div className="login-hint">
            {localPath
              ? `Chemin détecté : ${localPath}`
              : "Chemin local indisponible (ouvrir cette page dans Tauri)."}
          </div>
          <div className="login-actions">
            <button
              type="button"
              className="login-btn secondary"
              onClick={() => setUrl(defaultSqliteUrl)}
              disabled={!defaultSqliteUrl || saving || testing}
            >
              Utiliser le chemin détecté
            </button>
            <button
              type="button"
              className="login-btn secondary"
              onClick={handleTest}
              disabled={testing || saving}
            >
              {testing ? "Test en cours…" : "Tester la connexion"}
            </button>
          </div>
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
