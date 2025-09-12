import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import { HashRouter } from "react-router-dom";
import "./globals.css";
import "nprogress/nprogress.css";
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>
);

