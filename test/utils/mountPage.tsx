import React from "react";
import type { ComponentType, ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider as BaseAuthProvider } from "@/hooks/useAuth";
import { writeStoredUser } from "@/lib/auth/sessionState";
import { sessionStore } from "@/lib/auth/sessionStore";

const MOCK_USER = {
  id: "test-user",
  email: "test@example.com",
  mama_id: "test-mama",
  role: "admin"
};

function AuthProvider({
  children,
  mockAuthenticated = false
}: {
  children: ReactNode;
  mockAuthenticated?: boolean;
}) {
  void mockAuthenticated;

  const clientRef = React.useRef<QueryClient>();

  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false
        },
        mutations: {
          retry: false
        }
      }
    });
  }

  return (
    <QueryClientProvider client={clientRef.current}>
      <HelmetProvider>
        <BaseAuthProvider>{children}</BaseAuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

type MountPageOptions = {
  path?: string;
  mockAuthenticated?: boolean;
};

export function mountPage(
  Page: ComponentType,
  options: MountPageOptions = {}
): RenderResult {
  const { path = "/#/fake", mockAuthenticated = true } = options;

  sessionStore.clear();
  if (mockAuthenticated) {
    writeStoredUser({ ...MOCK_USER });
  } else {
    writeStoredUser(null);
  }

  return render(
    <AuthProvider mockAuthenticated={mockAuthenticated}>
      <MemoryRouter initialEntries={[path]}>
        <Page />
      </MemoryRouter>
    </AuthProvider>
  );
}
