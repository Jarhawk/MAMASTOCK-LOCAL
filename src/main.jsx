import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import "@/debug/devAuth";
import "@/debug/ensureLocalAdmin";
import "./globals.css";
import "nprogress/nprogress.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </AuthProvider>
);

