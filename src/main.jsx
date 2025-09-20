import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import appRouter from "@/router";
import { AuthProvider } from "@/hooks/useAuth";
import "./index.css";
import "@/services/analytics";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Impossible de trouver l’élément #root");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  </React.StrictMode>
);
