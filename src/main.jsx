import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import "@/debug/ensureLocalAdmin";
import "@/debug/devAuth";
import "./globals.css";
import "nprogress/nprogress.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

