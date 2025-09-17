import { describe, expect, it } from "vitest";

import { resolveSidebarState } from "./Sidebar.jsx";

describe("resolveSidebarState", () => {
  it("always shows the sidebar in dev mode", () => {
    const state = resolveSidebarState({
      isDev: true,
      loading: true,
      access_rights: null,
      userData: null
    });
    expect(state.hideBecauseLoading).toBe(false);
    expect(state.showSidebar).toBe(true);
  });

  it("hides the sidebar while loading outside dev", () => {
    const state = resolveSidebarState({
      isDev: false,
      loading: true,
      access_rights: null,
      userData: null
    });
    expect(state.hideBecauseLoading).toBe(true);
    expect(state.showSidebar).toBe(false);
  });

  it("shows the sidebar in prod when rights exist", () => {
    const state = resolveSidebarState({
      isDev: false,
      loading: false,
      access_rights: { dashboard: true },
      userData: null
    });
    expect(state.hideBecauseLoading).toBe(false);
    expect(state.showSidebar).toBe(true);
  });
});
