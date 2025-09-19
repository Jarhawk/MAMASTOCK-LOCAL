import { describe, expect, it } from "vitest";

import { resolveSidebarState } from "@/Sidebar";

describe("resolveSidebarState", () => {
  it("is always visible regardless of auth state", () => {
    expect(
      resolveSidebarState({
        isDev: false,
        loading: true,
        access_rights: null,
        userData: null,
      })
    ).toEqual({ hideBecauseLoading: false, showSidebar: true });
  });

  it("keeps the sidebar visible when signed out", () => {
    expect(
      resolveSidebarState({
        isDev: false,
        loading: false,
        access_rights: null,
        userData: { access_rights: null },
      })
    ).toEqual({ hideBecauseLoading: false, showSidebar: true });
  });
});
