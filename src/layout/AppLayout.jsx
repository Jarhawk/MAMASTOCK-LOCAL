import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "@/components/sidebar.autogen";
import Footer from "@/components/Footer";
import LayoutErrorBoundary from "@/components/LayoutErrorBoundary";
import Spinner from "@/components/ui/Spinner";

export function AppLayoutBoundary({ children }) {
  return (
    <LayoutErrorBoundary
      title="Erreur dans l’espace d’administration"
      message="Nous n’avons pas pu charger cette section. Vous pouvez revenir en arrière et réessayer."
    >
      {children}
    </LayoutErrorBoundary>
  );
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main
          id="content"
          tabIndex={-1}
          role="main"
          data-router-scroll-container
          className="flex-1 focus:outline-none"
        >
          <Suspense fallback={<Spinner label="Chargement de la page…" />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
