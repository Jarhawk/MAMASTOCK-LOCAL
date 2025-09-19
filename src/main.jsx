// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "./hooks/useAuth";
import { appRouter } from "./router";
import "./index.css";

import ScrollRestoration from "./ScrollRestoration"; // ⬅️ NEW

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        {/* Restaurateur de scroll compatible Hash Router */}
        <ScrollRestoration />
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
