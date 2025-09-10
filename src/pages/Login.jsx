import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage() {
  const nav = useNavigate();
  const { loginWithDb, registerWithDb } = useAuth();
  const [email, setEmail] = useState("admin@mamastock.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await loginWithDb(email, password);
      console.info("[login] OK");
      nav("/"); // redirige vers le tableau de bord
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    try {
      await registerWithDb(email, password);
      console.info("[register] OK");
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
        <h1 className="login-title">Connexion</h1>

        {error ? <div className="login-error">{error}</div> : null}

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="login-label">Mot de passe</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-btn">Se connecter</button>
          <button className="login-btn secondary" onClick={onRegister}>Créer un compte local</button>
        </form>
      </div>
    </div>
  );
}

