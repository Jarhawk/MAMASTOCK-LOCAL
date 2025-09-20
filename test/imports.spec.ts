import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("lazy routes", () => {
  it("imports every lazy route module", async () => {
    const currentFilePath = fileURLToPath(import.meta.url);
    const routerPath = path.resolve(
      path.dirname(currentFilePath),
      "../src/router.autogen.tsx",
    );
    const routerSource = await readFile(routerPath, "utf-8");
    const importMatcher = /import\([^)]*?"([^"\\]+)"\)/g;

    const modules = new Set<string>();
    for (const match of routerSource.matchAll(importMatcher)) {
      modules.add(match[1]);
    }

    expect(modules.size).toBeGreaterThan(0);

    const errors: Array<{ moduleId: string; error: unknown }> = [];
    for (const moduleId of modules) {
      try {
        await import(moduleId);
      } catch (error) {
        errors.push({ moduleId, error });
      }
    }

    if (errors.length > 0) {
      const formatted = errors
        .map(({ moduleId, error }) => {
          const message =
            error instanceof Error
              ? error.stack ?? error.message
              : String(error);
          return `${moduleId}: ${message}`;
        })
        .join("\n\n");

      throw new Error(`Failed to import ${errors.length} module(s):\n${formatted}`);
    }
  }, 120_000);
});
