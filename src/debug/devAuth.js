// Development-only authentication helpers.
// This file is intentionally minimal and will be tree-shaken in production.
if (import.meta.env?.DEV) {
  console.info("[devAuth] development auth helpers loaded");
}
