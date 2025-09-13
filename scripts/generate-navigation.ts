// Node + TypeScript (ts-node/tsx compatible)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, sep, posix } from "node:path";

function toPosix(p: string) { return p.split(sep).join("/"); }
function fileToRoute(file: string) {
  // src/pages/parametrage/Familles.tsx -> { path: "/parametrage/familles", label: "Familles", group: "Paramétrage" }
  const p = toPosix(file);
  const m = p.match(/^src\/pages\/(.+?)\.(t|j)sx?$/i);
  if (!m) return null;
  const rel = m[1]; // e.g. "parametrage/Familles"
  const parts = rel.split("/");
  const name = parts.pop()!;
  const dir = parts.join("/"); // may be ''

  // Label from filename:
  const label = name.replace(/\.(t|j)sx?$/i, "").replace(/[-_]/g, " ");

  // Path:
  const path =
    name.toLowerCase().startsWith("dashboard")
      ? "/"
      : "/" + [dir, name].filter(Boolean).join("/").toLowerCase();

  // Group:
  let group: string | undefined;
  if (dir.toLowerCase() === "parametrage") group = "Paramétrage";

  // Exclusions:
  if (/onboarding/i.test(name)) return null;

  return { path, label, group, importPath: `/${p}` };
}

function buildSidebar(items: {path:string; label?:string; group?:string}[]) {
  const groups = new Map<string, { title: string; items: {to:string; label:string}[] }>();
  const push = (title: string, to: string, label: string) => {
    if (!groups.has(title)) groups.set(title, { title, items: [] });
    groups.get(title)!.items.push({ to, label });
  };

  for (const it of items) {
    if (!it.label) continue;
    if (it.group) push(it.group, it.path, it.label);
    else {
      // top-level group
      push("Général", it.path, it.label);
    }
  }
  // trier par titre puis label
  const out = [...groups.values()].map(g => ({ ...g, items: g.items.sort((a,b)=>a.label.localeCompare(b.label,"fr")) }));
  return out.sort((a,b)=>a.title.localeCompare(b.title,"fr"));
}

function run() {
  const invPath = resolve("src-inventory.json");
  const raw = readFileSync(invPath, "utf8");
  const inv = JSON.parse(raw) as { files?: string[]; pages?: string[] };

  const allFiles = inv.files ?? inv.pages ?? [];
  const pageFiles = allFiles.filter(f => /^src[\/\\]pages[\/\\].+\.(t|j)sx?$/i.test(f));
  const routes = pageFiles.map(fileToRoute).filter(Boolean) as any[];

  // router.autogen.tsx
  const routerOut =
`import React from "react";

export type RouteItem = {
  path: string;
  label?: string;
  group?: string;
  importPath: string;
};

export const autoRoutes: RouteItem[] = ${JSON.stringify(routes, null, 2)};

export function buildAutoElements() {
  const routes = autoRoutes.map(r => {
    const Page = React.lazy(() => import(/* @vite-ignore */ r.importPath));
    return { path: r.path, element: <React.Suspense fallback={null}><Page /></React.Suspense> };
  });
  routes.push({ path: "*", element: <div style={{padding:16}}>Page introuvable</div> });
  return routes;
}
`;
  writeFileSync(resolve("src/router.autogen.tsx"), routerOut, "utf8");

  // sidebar.autogen.tsx
  const sidebar = buildSidebar(routes);
  const sidebarOut =
`export type MenuGroup = { title: string; items: { to: string; label: string }[] };
export const sidebarAuto: MenuGroup[] = ${JSON.stringify(sidebar, null, 2)};
`;
  writeFileSync(resolve("src/sidebar.autogen.tsx"), sidebarOut, "utf8");

  console.log("✓ generated src/router.autogen.tsx & src/sidebar.autogen.tsx from src-inventory.json");
}
run();
