import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const originalEnv = { ...import.meta.env };

describe("AuthContext dev fallback", () => {
  beforeEach(() => {
    localStorage.clear();
    (import.meta.env as any).DEV = true;
    (import.meta.env as any).VITE_DEV_FAKE_AUTH = "1";
    delete (import.meta.env as any).VITE_DEV_FORCE_SIDEBAR;
  });

  afterEach(() => {
    localStorage.clear();
    (import.meta.env as any).DEV = originalEnv.DEV;
    if (originalEnv.VITE_DEV_FAKE_AUTH === undefined) {
      delete (import.meta.env as any).VITE_DEV_FAKE_AUTH;
    } else {
      (import.meta.env as any).VITE_DEV_FAKE_AUTH = originalEnv.VITE_DEV_FAKE_AUTH;
    }
    if (originalEnv.VITE_DEV_FORCE_SIDEBAR === undefined) {
      delete (import.meta.env as any).VITE_DEV_FORCE_SIDEBAR;
    } else {
      (import.meta.env as any).VITE_DEV_FORCE_SIDEBAR = originalEnv.VITE_DEV_FORCE_SIDEBAR;
    }
  });

  it("provides admin rights when dev fake auth is enabled", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.devFakeAuth).toBe(true);
    expect(result.current.role).toBe("admin");
    expect(result.current.access_rights?.produits).toBe(true);
  });
});
