import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginLocal, listLocalUsers } from "@/auth/localAccount";
import "./login.css";
import LinkPrefetch from "@/components/LinkPrefetch";
import {
  clearRedirectTo,
  getRedirectTo,
  redirectHashToPath,
  setRedirectTo
} from "@/auth/redirect";
import { isFirstRunComplete } from "@/lib/auth/sessionState";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("admin@mamastock.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [canCreateAccount, setCanCreateAccount] = useState(() =>
    isFirstRunComplete()
  );

  useEffect(() => {
    const redirectParam = searchParams.get("redirectTo");
    if (redirectParam) {
      setRedirectTo(redirectParam);
    } else {
      clearRedirectTo();
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    listLocalUsers()
      .then((users) => {
        if (mounted) setCanCreateAccount(users.length > 0);
      })
      .catch(() => {
        if (mounted) setCanCreateAccount(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const user = await loginLocal(email, password);
      await signIn(user);
      const storedRedirect = getRedirectTo();
      const redirectParam = storedRedirect ?? searchParams.get("redirectTo");
      const targetPath = redirectHashToPath(redirectParam);
      clearRedirectTo();
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main
      id="content"
      tabIndex={-1}
      role="main"
      className="login-wrapper"
    >
      <div className="login-card">
        <img
          src="/android-chrome-512x512.png"
          alt="MamaStock"
          className="login-logo"
          width={72}
          height={72}
        />

        <h1 className="login-title">Connexion</h1>

        {error ? <div className="login-error">{error}</div> : null}

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="login-input"
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label className="login-label" htmlFor="login-password">
            Mot de passe
          </label>
          <input
            id="login-password"
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>

        {canCreateAccount ? (
          <LinkPrefetch to="/setup" className="login-link">
            Créer un compte
          </LinkPrefetch>
        ) : null}
      </div>
    </main>
  );
}
