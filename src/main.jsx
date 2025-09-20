// MamaStock © 2025
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createHashRouter,
  RouterProvider,
  Outlet,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

/* ---------- Helpers ---------- */
function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} - MamaStock`;
  }, [title]);
}

function SkipLink() {
  return (
    <a
      href="#content"
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 1000,
        padding: "8px 12px",
        border: "1px solid #555",
        background: "#fff",
        borderRadius: 6,
        textDecoration: "none",
      }}
    >
      Aller au contenu principal
    </a>
  );
}

/* ---------- Scroll restauration dans le conteneur #content ---------- */
function ScrollMemory() {
  const location = useLocation();
  const yByKeyRef = useRef(new Map());

  useEffect(() => {
    const container = document.getElementById("content");
    if (!container) return;
    const onScroll = () => {
      yByKeyRef.current.set(location.key, container.scrollTop);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [location.key]);

  useEffect(() => {
    const container = document.getElementById("content");
    if (!container) return;
    const y = yByKeyRef.current.get(location.key) ?? 0;
    requestAnimationFrame(() => {
      container.scrollTop = y;
    });
  }, [location.key]);

  return null;
}

/* ---------- Layout & Nav ---------- */
function Layout() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <SkipLink />
      <header
        style={{
          borderBottom: "1px solid #eee",
          padding: "12px 16px",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <strong>MamaStock</strong>
        <nav style={{ display: "flex", gap: 12 }}>
          <NavLink to="/accueil" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Accueil
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Dashboard
          </NavLink>
          <NavLink to="/alertes" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Alertes
          </NavLink>
          <NavLink to="/legal/rgpd" className={({ isActive }) => (isActive ? "active" : undefined)}>
            RGPD
          </NavLink>
          <NavLink to="/legal/cgu" className={({ isActive }) => (isActive ? "active" : undefined)}>
            CGU
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Admin
          </NavLink>
        </nav>
      </header>

      <main
        id="content"
        tabIndex={-1}
        style={{
          flex: 1,
          outline: "none",
          overflow: "auto",
          padding: "16px",
          scrollBehavior: "auto",
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: "1px solid #eee",
          padding: "12px 16px",
          fontSize: 12,
          color: "#666",
        }}
      >
        © {new Date().getFullYear()} MamaStock
      </footer>

      <ScrollMemory />
    </div>
  );
}

/* ---------- Pages ---------- */
function DashboardPage() {
  useDocumentTitle("Accueil");
  return (
    <section>
      <h1>Accueil</h1>
      <p>Bienvenue sur le tableau de bord.</p>
      <div style={{ height: 1000 }} />
      <p>Fin de page.</p>
    </section>
  );
}

function RGPDPage() {
  useDocumentTitle("Données & Confidentialité");
  return (
    <section>
      <h1>Données &amp; Confidentialité</h1>
      <p>Informations RGPD…</p>
      <div style={{ height: 1200 }} />
      <p>Fin de page.</p>
    </section>
  );
}

function CGUPage() {
  useDocumentTitle("Conditions Générales d’Utilisation");
  return (
    <section>
      <h1>Conditions Générales d’Utilisation</h1>
      <p>CGU…</p>
      <div style={{ height: 800 }} />
      <p>Fin de page.</p>
    </section>
  );
}

function NotFoundPage() {
  useDocumentTitle("Page non trouvée");
  return (
    <section>
      <h1>404</h1>
      <p>La page demandée est introuvable.</p>
    </section>
  );
}

/* ---------- Auth minimal pour les tests ---------- */
const AUTH_USER_KEY = "auth.user";
const AUTH_ACCOUNTS_KEY = "auth.accounts";

function readAccounts() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Unable to read accounts", error);
  }
  return {};
}

function saveAccount(email, account) {
  if (typeof window === "undefined") return;
  const next = readAccounts();
  next[email] = account;
  try {
    window.localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("Unable to persist account", error);
  }
}

function persistSessionUser(user) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Unable to write session storage", error);
  }
  try {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Unable to mirror auth user", error);
  }
}

function readSessionUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Unable to parse session user", error);
    return null;
  }
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const sessionUser = readSessionUser();

  if (!sessionUser) {
    const search = location.search || "";
    const currentPath = `${location.pathname}${search}` || "/dashboard";
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("redirectTo", currentPath);
        window.localStorage.setItem("redirectTo", currentPath);
      }
    } catch (error) {
      console.warn("Unable to persist redirect", error);
    }
    const params = new URLSearchParams();
    params.set("redirectTo", currentPath);
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }

  return children;
}

function SetupPage() {
  useDocumentTitle("Installation");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (pwd !== pwd2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Email invalide.");
      return;
    }

    const account = {
      email: normalizedEmail,
      password: pwd,
      role: "admin",
    };

    saveAccount(normalizedEmail, account);
    persistSessionUser({ email: normalizedEmail, role: account.role });

    try {
      window.sessionStorage.removeItem("redirectTo");
      window.localStorage.removeItem("redirectTo");
    } catch {}

    setError("");
    navigate("/dashboard", { replace: true });
  };

  return (
    <section>
      <h1>Configuration</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Email
          <input
            id="setup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Mot de passe
          <input
            id="setup-password"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Confirmer
          <input
            id="setup-password-confirm"
            type="password"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit">Valider</button>
        {error ? (
          <p style={{ color: "#b3261e", margin: 0 }}>{error}</p>
        ) : null}
      </form>
    </section>
  );
}

function LoginPage() {
  useDocumentTitle("Connexion");
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    const extract = (value) => {
      if (!value) return null;
      return new URLSearchParams(value).get("redirectTo");
    };

    const direct = extract(location.search);
    if (direct) return direct;

    const hashIndex = location.hash?.indexOf("?") ?? -1;
    if (hashIndex >= 0) {
      const hashQuery = location.hash.slice(hashIndex);
      const fromHash = extract(hashQuery);
      if (fromHash) return fromHash;
    }

    if (typeof window !== "undefined") {
      const fromSession = window.sessionStorage.getItem("redirectTo");
      if (fromSession) return fromSession;
      const fromLocal = window.localStorage.getItem("redirectTo");
      if (fromLocal) return fromLocal;
    }

    return null;
  }, [location.hash, location.search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (redirectTo) {
        window.sessionStorage.setItem("redirectTo", redirectTo);
        window.localStorage.setItem("redirectTo", redirectTo);
      } else {
        window.sessionStorage.removeItem("redirectTo");
        window.localStorage.removeItem("redirectTo");
      }
    } catch {}
  }, [redirectTo]);

  const onSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Email invalide.");
      return;
    }

    const accounts = readAccounts();
    const account = accounts[normalizedEmail];
    if (!account || account.password !== pwd) {
      setError("Identifiants incorrects.");
      return;
    }

    const user = { email: normalizedEmail, role: account.role ?? "admin" };
    persistSessionUser(user);

    try {
      window.sessionStorage.removeItem("redirectTo");
      window.localStorage.removeItem("redirectTo");
    } catch {}

    setError("");
    const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
    navigate(target, { replace: true });
  };

  return (
    <section>
      <h1>Connexion</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Email
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          Mot de passe
          <input
            id="login-password"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit">Se connecter</button>
        {error ? (
          <p style={{ color: "#b3261e", margin: 0 }}>{error}</p>
        ) : null}
      </form>
    </section>
  );
}

function AdminPage() {
  useDocumentTitle("Administration");
  return (
    <section>
      <h1>Admin</h1>
      <p>Espace protégé.</p>
      <div style={{ height: 1000 }} />
    </section>
  );
}

function AlertesPage() {
  useDocumentTitle("Alertes");
  return (
    <section>
      <h1>Alertes</h1>
      <p>Liste des alertes en cours.</p>
      <div style={{ height: 1000 }} />
    </section>
  );
}

/* ---------- Router ---------- */
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "accueil",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: "rgpd", element: <Navigate to="/legal/rgpd" replace /> }, // legacy → legal/rgpd
      { path: "legal/rgpd", element: <RGPDPage /> },
      { path: "legal/cgu", element: <CGUPage /> },
      { path: "setup", element: <SetupPage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "alertes",
        element: (
          <ProtectedRoute>
            <AlertesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

/* ---------- Mount ---------- */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
