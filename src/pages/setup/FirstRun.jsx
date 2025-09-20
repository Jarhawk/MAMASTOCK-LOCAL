import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerLocal, listLocalUsers } from "@/auth/localAccount";
import '@/pages/login.css';
import LinkPrefetch from "@/components/LinkPrefetch";
import useAuth from "@/hooks/useAuth";

export default function FirstRun() {
  const navigate = useNavigate();
  const { signIn, setFirstRun, setRedirectTo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState(null);

  useEffect(() => {
    setRedirectTo(null);
  }, [setRedirectTo]);

  useEffect(() => {
    let mounted = true;

    listLocalUsers()
      .then((users) => {
        if (!mounted) return;
        setExistingUsers(users.length);
        setFirstRun(users.length === 0);
      })
      .catch((err) => {
        console.warn("[setup] Impossible de lire les comptes locaux", err);
        if (!mounted) return;
        setExistingUsers(0);
        setFirstRun(true);
      });

    return () => {
      mounted = false;
    };
  }, [setFirstRun]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = (existingUsers ?? 0) > 0 ? "Créer un compte local" : "Configuration initiale";
    document.title = `${baseTitle} • MamaStock`;
  }, [existingUsers]);

  const helperMessage = useMemo(() => {
    if ((existingUsers ?? 0) > 0) {
      if (existingUsers === 1) {
        return "Un compte local existe déjà. Utilisez ce formulaire pour en ajouter un nouveau.";
      }
      return `${existingUsers} comptes locaux existent déjà. Utilisez ce formulaire pour en ajouter un nouveau.`;
    }
    return "Bienvenue ! Renseignez un email et un mot de passe pour créer l’administrateur local.";
  }, [existingUsers]);

  const hasExistingUsers = useMemo(() => (existingUsers ?? 0) > 0, [existingUsers]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("L’email est obligatoire.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("L’email est invalide.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerLocal(normalizedEmail, password, "admin");
      await signIn(user);
      setFirstRun(false);
      setRedirectTo(null);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

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
        <h1 className="login-title">Créer un compte administrateur</h1>
        <p className="login-subtitle">Ce compte disposera de tous les droits sur cet appareil.</p>
        <p className="login-helper">{helperMessage}</p>
        {error ? <div className="login-error">{error}</div> : null}
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="setup-email">
            Email
          </label>
          <input
            id="setup-email"
            className="login-input"
            type="email"
            placeholder="admin@exemple.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            autoFocus
            required
          />

          <label className="login-label" htmlFor="setup-password">
            Mot de passe
          </label>
          <input
            id="setup-password"
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="login-hint">Minimum 8 caractères.</p>

          <label className="login-label" htmlFor="setup-password-confirm">
            Confirmer le mot de passe
          </label>
          <input
            id="setup-password-confirm"
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Création en cours…" : "Créer mon compte administrateur"}
          </button>
        </form>
        <p className="login-footer">
          Les comptes locaux sont enregistrés uniquement sur cet appareil. Pensez à sauvegarder ces informations en cas de
          réinstallation.
        </p>
        {hasExistingUsers ? (
          <LinkPrefetch to="/login" className="login-link">
            Retour à la connexion
          </LinkPrefetch>
        ) : null}
      </div>
    </div>
  );
}
