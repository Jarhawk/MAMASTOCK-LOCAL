import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import Loading from "@/ui/Loading"; // spinner existant ou simple div
import { buildAutoElements } from "./router.autogen";

const children = [
  // ...tes routes statiques si tu en as
  ...buildAutoElements()
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children,
  },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
