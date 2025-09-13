import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "@/router.autogen";

const router = createBrowserRouter([...routes]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
