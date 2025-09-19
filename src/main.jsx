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
  // Visible pour Playwright (waitForSelector -> visible)
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
  const lastKeyRef = useRef(location.key);
  const yByKeyRef = useRef(new Map());

  // Écoute le scroll du conteneur pour mémoriser la position
  useEffect(() => {
    const container = document.getElementById("content");
    if (!container) return;
    const onScroll = () => {
      yByKeyRef.current.set(location.key, container.scrollTop);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [location.key]);

  // Restaure à chaque changement de clé d'historique
  useEffect(() => {
    lastKeyRef.current = location.key;
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
          <NavLink
            to="/legal/rgpd"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            RGPD
          </NavLink>
          <NavLink
            to="/legal/cgu"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            CGU
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Admin
          </NavLink>
        </nav>
      </header>

      {/* Conteneur scrollable ciblé par le skip-link */}
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
const AUTH_KEY = "mamastock:isLoggedIn";

function ProtectedRoute({ children }) {
  const isLoggedIn =
    typeof localStorage !== "undefined" && localStorage.getItem(AUTH_KEY) === "true";
  const location = useLocation();
  if (!isLoggedIn) {
    const returnTo = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/setup?returnTo=${returnTo}`} replace />;
  }
  return children;
}

function SetupPage() {
  useDocumentTitle("Installation");
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(AUTH_KEY, "true");
    const ret = params.get("returnTo");
    if (ret) {
      try {
        const url = decodeURIComponent(ret);
        if (url.startsWith("/")) navigate(url, { replace: true });
        else navigate("/admin", { replace: true });
      } catch {
        navigate("/admin", { replace: true });
      }
    } else {
      navigate("/admin", { replace: true });
    }
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

/* ---------- Router ---------- */
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/legal/rgpd" replace /> },
      { path: "rgpd", element: <Navigate to="/legal/rgpd" replace /> }, // legacy → legal/rgpd
      { path: "legal/rgpd", element: <RGPDPage /> },
      { path: "legal/cgu", element: <CGUPage /> },
      { path: "setup", element: <SetupPage /> },
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
