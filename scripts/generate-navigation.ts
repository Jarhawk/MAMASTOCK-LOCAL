import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative, sep } from "node:path";
import { diffLines } from "diff";

type PlanItem = { label: string; path: string; icon?: string; file?: string };
type SidebarPlan = Record<string, PlanItem[]>;
type SrcInventory = { pages?: string[]; files?: string[] };

export type SidebarItem = { path: string; label: string; icon?: string; children?: SidebarItem[] };

function toPosix(p: string) {
  return p.split(sep).join("/");
}

export function loadSources() {
  const paths = [
    resolve("sidebar.plan.json"),
    resolve("reports/src-inventory.json"),
    resolve("var/src-inventory.json"),
  ];
  const tried = [...paths];
  if (existsSync(paths[0])) {
    const plan = JSON.parse(readFileSync(paths[0], "utf8")) as SidebarPlan;
    return { plan, tried, sources: [paths[0]] };
  }
  for (let i = 1; i < paths.length; i++) {
    if (existsSync(paths[i])) {
      const inventory = JSON.parse(readFileSync(paths[i], "utf8")) as SrcInventory;
      return { inventory, tried, sources: [paths[i]] };
    }
  }
  return { tried, sources: [] };
}

export function buildSidebar(plan?: SidebarPlan, inventory?: SrcInventory): SidebarItem[] {
  if (plan) {
    return Object.entries(plan)
      .filter(([k]) => !k.startsWith("__"))
      .map(([label, items]) => ({
        label,
        children: items.map(it => ({
          path: "/" + it.path.replace(/^\/?/, ""),
          label: it.label,
          icon: it.icon,
        })),
      }));
  }
  const pages = inventory?.pages ?? inventory?.files ?? [];
  const groups: Record<string, SidebarItem> = {};
  const domains = new Map([
    ["parametrage", "Paramétrage"],
    ["produits", "Produits"],
    ["factures", "Factures"],
    ["inventaires", "Inventaires"],
    ["recettes", "Recettes"],
    ["menus", "Menus"],
    ["fournisseurs", "Fournisseurs"],
    ["taches", "Tâches"],
    ["requisitions", "Requisitions"],
    ["achats", "Achats"],
  ]);
  const ignore = /onboarding|aide|debug/i;
  for (const file of pages) {
    if (!/^src[\/]/i.test(file)) continue;
    if (ignore.test(file)) continue;
    const rel = toPosix(file).replace(/^src\/pages\//, "");
    const segs = rel.split("/");
    const fname = segs.pop()!;
    const domain = segs[0] ?? "";
    const groupLabel = domains.get(domain.toLowerCase()) ?? (domain ? domain[0].toUpperCase() + domain.slice(1) : "Divers");
    const label = fname.replace(/\.[tj]sx?$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const path = "/" + [domain, fname.replace(/\.[tj]sx?$/, "")].filter(Boolean).join("/").toLowerCase();
    if (!groups[groupLabel]) groups[groupLabel] = { label: groupLabel, children: [] };
    groups[groupLabel].children!.push({ path, label });
  }
  return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
}

function findComponentPath(webPath: string): string | undefined {
  const parts = webPath.replace(/^\//, "").split("/");
  const fileBase = parts.pop()!;
  const dir = parts.join("/");
  const fileName = fileBase.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
  const dirLower = dir;
  const dirCap = dir.replace(/(^|\/)(\w)/g, (_, sep, c) => sep + c.toUpperCase());
  const dirs = dir ? [dirLower, dirCap] : ["" ];
  const exts = [".tsx", ".ts", ".jsx", ".js"];
  for (const d of dirs) {
    for (const ext of exts) {
      const abs = resolve("src/pages", d, fileName + ext);
      if (existsSync(abs)) {
        const rel = toPosix(relative(resolve("src"), abs));
        return "./" + rel;
      }
    }
  }
  return undefined;
}

export function buildRoutes(sidebar: SidebarItem[]) {
  const items = sidebar.flatMap(sec => sec.children ?? []);
  const imports: string[] = [];
  const entries: { path: string; element: string }[] = [];
  const varForPath: Record<string, string> = {};
  let hasMissing = false;
  items.forEach((it, idx) => {
    const imp = findComponentPath(it.path);
    let varName: string;
    if (imp) {
      varName = `Page${idx}`;
      imports.push(`const ${varName} = React.lazy(() => import(${JSON.stringify(imp)}));`);
    } else {
      varName = "Missing";
      hasMissing = true;
    }
    varForPath[it.path] = varName;
    entries.push({ path: it.path, element: `<React.Suspense fallback={null}><${varName} /></React.Suspense>` });
  });
  const dashVar = varForPath["/dashboard"];
  if (dashVar) {
    entries.unshift({ path: "/", element: `<React.Suspense fallback={null}><${dashVar} /></React.Suspense>` });
  } else if (entries[0]) {
    entries.unshift({ path: "/", element: entries[0].element });
  }
  let code = `import React from \"react\";\nimport type { RouteObject } from \"react-router-dom\";\n`;
  if (imports.length) code += imports.join("\n") + "\n";
  if (hasMissing) code += `const Missing = () => <div>NotFound: composant manquant</div>;\n`;
  code += "\nexport const routes: RouteObject[] = [\n";
  code += entries.map(r => `  { path: ${JSON.stringify(r.path)}, element: ${r.element} }`).join(",\n");
  code += "\n];\n\nexport default routes;\n";
  return code;
}

function generateSidebarFile(sidebar: SidebarItem[]) {
  return `import React from \"react\";\nimport { NavLink } from \"react-router-dom\";\n\nexport type SidebarItem = { path: string; label: string; icon?: string; children?: SidebarItem[] };\nexport const SIDEBAR: SidebarItem[] = ${JSON.stringify(sidebar, null, 2)};\n\nexport default function Sidebar() {\n  return (\n    <aside className=\"w-64 border-r h-full overflow-auto\">\n      {SIDEBAR.map(section => (\n        <div key={section.label} className=\"p-3\">\n          <div className=\"text-xs font-semibold opacity-70 mb-2\">{section.label}</div>\n          {section.children?.map(it => (\n            <NavLink\n              key={it.path}\n              to={it.path}\n              className={({ isActive }) =>\n                \"block px-3 py-2 rounded hover:bg-gray-100 \" + (isActive ? \"bg-gray-100 font-medium\" : \"\")\n              }\n            >\n              {it.label}\n            </NavLink>\n          ))}\n        </div>\n      ))}\n    </aside>\n  );\n}\n`;
}

function writeFileWithDiff(file: string, content: string) {
  const abs = resolve(file);
  mkdirSync(dirname(abs), { recursive: true });
  const prev = existsSync(abs) ? readFileSync(abs, "utf8") : "";
  if (prev === content) {
    console.log(`- ${file}: Aucun changement`);
    return;
  }
  writeFileSync(abs, content, "utf8");
  console.log(`- ${file}:`);
  const diff = diffLines(prev, content);
  diff.slice(0, 20).forEach(part => {
    const prefix = part.added ? "+" : part.removed ? "-" : " ";
    process.stdout.write(prefix + part.value);
  });
  if (diff.length > 20) process.stdout.write("...\n");
}

function main() {
  const { plan, inventory, sources, tried } = loadSources();
  if (!plan && !inventory) {
    console.error("Aucune source trouvée. Chemins testés:\n" + tried.join("\n"));
    process.exit(1);
  }
  console.log("Navigation autogen – Rapport");
  console.log("Fichiers lus:", sources.join(", "));
  const sidebar = buildSidebar(plan, inventory);
  console.log("Sections/items générés:");
  sidebar.forEach(sec => {
    console.log(`  ${sec.label}`);
    sec.children?.forEach(it => console.log(`    - ${it.path} ${it.label}`));
  });
  const routerCode = buildRoutes(sidebar);
  const sidebarCode = generateSidebarFile(sidebar);
  console.log("Fichiers écrits:");
  writeFileWithDiff("src/router.autogen.tsx", routerCode);
  writeFileWithDiff("src/components/sidebar.autogen.tsx", sidebarCode);
}

main();

