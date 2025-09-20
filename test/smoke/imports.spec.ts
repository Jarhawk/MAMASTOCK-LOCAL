import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { collectDynamicImportModuleIds } from "../utils/routerModules";

describe("router page imports", () => {
  it(
    "imports every page referenced by the router",
    async () => {
      const currentFilePath = fileURLToPath(import.meta.url);
      const repoRoot = path.resolve(path.dirname(currentFilePath), "../../");

      const routerFiles = [
        path.join(repoRoot, "src/router.autogen.tsx"),
        path.join(repoRoot, "src/router.tsx"),
      ];

      const moduleIds = new Set<string>();
      for (const routerFile of routerFiles) {
        const ids = await collectDynamicImportModuleIds(routerFile);
        ids.forEach((id) => moduleIds.add(id));
      }

      expect(moduleIds.size).toBeGreaterThan(0);

      const errors: Array<{ moduleId: string; error: unknown }> = [];

      for (const moduleId of Array.from(moduleIds).sort()) {
        try {
          const imported = await import(moduleId);

          if (!("default" in imported)) {
            errors.push({
              moduleId,
              error: new Error("missing default export"),
            });
          }
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

        throw new Error(
          `Failed to import ${errors.length} router page(s):\n${formatted}`,
        );
      }
    },
    120_000,
  );
});
