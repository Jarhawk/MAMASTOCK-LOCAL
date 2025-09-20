import { readFile } from "node:fs/promises";

const DYNAMIC_IMPORT_PATTERN = /import\((?:[^)(]|\([^)(]*\))*?["']([^"'\\]+)["']\)/gs;

export async function collectDynamicImportModuleIds(
  filePath: string,
): Promise<string[]> {
  const source = await readFile(filePath, "utf-8");
  const moduleIds = new Set<string>();

  for (const match of source.matchAll(DYNAMIC_IMPORT_PATTERN)) {
    const moduleId = match[1];
    if (moduleId) {
      moduleIds.add(moduleId);
    }
  }

  return Array.from(moduleIds);
}
