import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import type { ComponentType } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { mountPage } from "../utils/mountPage";

const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const [first] = args;
    if (typeof first === "string" && first.includes("not wrapped in act")) {
      return;
    }
    originalConsoleError(...(args as Parameters<typeof console.error>));
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

const currentFilePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFilePath), "../../");

const pageFiles = Array.from(
  new Set(
    await fg("src/pages/**/*.{jsx,tsx}", {
      cwd: repoRoot,
      dot: false,
      onlyFiles: true
    })
  )
).sort();

describe("page components", () => {
  for (const filePath of pageFiles) {
    it(`mounts ${filePath}`, async () => {
      const moduleId = filePath.replace(/^src\//, "@/");
      const imported = await import(moduleId);
      const Page = imported?.default as ComponentType | undefined;

      if (!Page) {
        throw new Error(`Missing default export for ${moduleId}`);
      }

      const { unmount } = mountPage(Page);

      expect(true).toBe(true);

      unmount();
    });
  }
});
