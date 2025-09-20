import { describe, it, expect } from "vitest";

const modules = [
  "@/auth/authAdapter",
  "@/auth/sqlAuth",
  "@/auth/sqliteAuth",
  "@/db/index",
  "@/components/Footer.jsx",
  "@/pages/Accueil.jsx",
];

describe("smoke imports", () => {
  for (const mod of modules) {
    it(`can import ${mod}`, async () => {
      const imported = await import(mod);
      expect(imported).toBeTruthy();
    });
  }
});
