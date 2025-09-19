import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import ScrollRestoration from "./ScrollRestoration";

// Skip-link basique (les tests l’utilisent). Ton contenu principal
// doit avoir id="content" (déjà le cas dans ton app).
const SkipLink = () => (
  <a href="#content" style={{
    position: "absolute",
    left: "-9999px",
    top: "auto",
    width: "1px",
    height: "1px",
    overflow: "hidden"
  }}
  onFocus={(e) => {
    // le rendre visible quand il reçoit le focus au clavier
    e.currentTarget.style.left = "8px";
    e.currentTarget.style.top = "8px";
    e.currentTarget.style.width = "auto";
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.zIndex = "1000";
    e.currentTarget.style.background = "white";
    e.currentTarget.style.padding = "6px 10px";
    e.currentTarget.style.borderRadius = "6px";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.15)";
  }}
  onBlur={(e) => {
    // le re-cache quand il perd le focus
    e.currentTarget.style.left = "-9999px";
    e.currentTarget.style.top = "auto";
    e.currentTarget.style.width = "1px";
    e.currentTarget.style.height = "1px";
    e.currentTarget.style.zIndex = "auto";
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.padding = "0";
    e.currentTarget.style.borderRadius = "0";
    e.currentTarget.style.boxShadow = "none";
  }}>
    Aller au contenu
  </a>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <SkipLink />
      <ScrollRestoration />
      <App />
    </HashRouter>
  </React.StrictMode>
);
