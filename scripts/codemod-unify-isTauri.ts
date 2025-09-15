import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const SKIP = [
  path.join(ROOT, "src-tauri"),
  path.join(ROOT, "node_modules"),
  path.join(ROOT, "dist"),
  path.join(ROOT, "build"),
  path.join(ROOT, "reports"),
  path.join(ROOT, "var"),
];

const FILES = globSync("src/**/*.{js,jsx,ts,tsx}", { cwd: ROOT, absolute: true, dot: false });

function inSkip(p: string) {
  const norm = path.normalize(p);
  return SKIP.some((s) => norm.startsWith(path.normalize(s)));
}

function ensureIsTauriImport(ast: t.File) {
  const body = ast.program.body;
  let sqlImport: t.ImportDeclaration | null = null;
  let lastImportIdx = -1;

  for (let i = 0; i < body.length; i++) {
    const n = body[i];
    if (t.isImportDeclaration(n)) {
      lastImportIdx = i;
      if (t.isStringLiteral(n.source) && n.source.value === "@/lib/db/sql") {
        sqlImport = n;
      }
    }
  }

  if (sqlImport) {
    const hasIsTauri =
      sqlImport.specifiers?.some(
        (s) => t.isImportSpecifier(s) && t.isIdentifier(s.imported, { name: "isTauri" })
      ) ?? false;
    if (!hasIsTauri) {
      sqlImport.specifiers.push(
        t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))
      );
      return true;
    }
    return false;
  } else {
    const decl = t.importDeclaration(
      [t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))],
      t.stringLiteral("@/lib/db/sql")
    );
    const insertIdx = lastImportIdx >= 0 ? lastImportIdx + 1 : 0;
    body.splice(insertIdx, 0, decl);
    return true;
  }
}

// Helpers to match patterns
function isWindowOrGlobalThis(id: t.Node | null | undefined) {
  return t.isIdentifier(id, { name: "window" }) || t.isIdentifier(id, { name: "globalThis" });
}
function isWindowTauri(node: t.Node | null | undefined) {
  return (
    t.isMemberExpression(node) &&
    isWindowOrGlobalThis(node.object as any) &&
    ((t.isIdentifier(node.property, { name: "__TAURI__" }) && !node.computed) ||
      (t.isStringLiteral(node.property, { value: "__TAURI__" }) && node.computed))
  );
}
function isImportMeta(node: t.Node | null | undefined) {
  return t.isMetaProperty(node) && t.isIdentifier(node.meta, { name: "import" }) &&
         t.isIdentifier(node.property, { name: "meta" });
}
function isImportMetaEnv(node: t.Node | null | undefined) {
  return t.isMemberExpression(node) && isImportMeta(node.object as any) &&
         t.isIdentifier(node.property, { name: "env" }) && !node.computed;
}
function isTauriPlatform(node: t.Node | null | undefined) {
  return t.isMemberExpression(node) && isImportMetaEnv(node.object as any) &&
         ((t.isIdentifier(node.property, { name: "TAURI_PLATFORM" }) && !node.computed) ||
          (t.isStringLiteral(node.property, { value: "TAURI_PLATFORM" }) && node.computed));
}
function isTypeof(node: t.Node | null | undefined, inner: (n: t.Node) => boolean) {
  return t.isUnaryExpression(node, { operator: "typeof" }) && node.argument && inner(node.argument);
}
function isTypeofWindow(node: t.Node | null | undefined) {
  return isTypeof(node, (n) => t.isIdentifier(n, { name: "window" }));
}
function isTypeofWindowTauri(node: t.Node | null | undefined) {
  return isTypeof(node, (n) => isWindowTauri(n));
}
function isUndefinedLiteral(n: t.Node | null | undefined) {
  return (t.isStringLiteral(n, { value: "undefined" }) || t.isIdentifier(n, { name: "undefined" }));
}
function isTypeofWindowNotUndefined(node: t.Node | null | undefined) {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!=" || node.operator === "!==") &&
    isTypeofWindow(node.left) &&
    isUndefinedLiteral(node.right)
  );
}
function isTypeofWindowTauriNotUndefined(node: t.Node | null | undefined) {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!=" || node.operator === "!==") &&
    isTypeofWindowTauri(node.left) &&
    isUndefinedLiteral(node.right)
  );
}

function replaceWithIsTauri(p: NodePath<t.Node>) {
  p.replaceWith(t.identifier("isTauri"));
}

let scanned = 0;
let changed = 0;
const changedFiles: string[] = [];
const errors: string[] = [];

for (const file of FILES) {
  if (inSkip(file)) continue;
  if (path.normalize(file) === path.normalize(path.join(ROOT, "src/lib/db/sql.ts"))) continue;
  let code: string;
  try {
    code = fs.readFileSync(file, "utf8");
  } catch (e: any) {
    errors.push(`read fail ${file}: ${e.message}`);
    continue;
  }

  let ast: t.File;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "classProperties",
        "importMeta",
        "topLevelAwait",
        "decorators-legacy",
      ],
    });
  } catch (e: any) {
    errors.push(`parse fail ${file}: ${e.message}`);
    continue;
  }

  scanned++;
  let fileChanged = false;
  let removedLocalIsTauriDecl = false;

  traverse(ast, {
    // Collapse logical patterns: typeof window !== 'undefined' && window.__TAURI__  => isTauri
    LogicalExpression(p) {
      const { node } = p;
      if (node.operator === "&&") {
        const L = node.left;
        const R = node.right;
        if (isTypeofWindowNotUndefined(L) && (isWindowTauri(R) || isTauriPlatform(R))) {
          replaceWithIsTauri(p);
          fileChanged = true;
        }
      }
    },

    // typeof window.__TAURI__ !== "undefined" => isTauri
    BinaryExpression(p) {
      const { node } = p;
      if (isTypeofWindowTauriNotUndefined(node)) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },

    // Member replacements:
    MemberExpression(p) {
      const { node } = p;
      if (isWindowTauri(node) || isTauriPlatform(node)) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },

    // !!(something we turned into isTauri) => isTauri
    UnaryExpression(p) {
      const { node } = p;
      if (node.operator === "!" && t.isUnaryExpression(node.argument, { operator: "!" }) &&
          t.isIdentifier(node.argument.argument, { name: "isTauri" })) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },

    // Remove local const isTauri = <pattern>;
    VariableDeclarator(p) {
      const { node } = p;
      if (t.isIdentifier(node.id, { name: "isTauri" }) && node.init) {
        const init = node.init;
        const matches =
          isWindowTauri(init) ||
          isTauriPlatform(init) ||
          isTypeofWindowNotUndefined(init) ||
          isTypeofWindowTauriNotUndefined(init) ||
          (t.isUnaryExpression(init, { operator: "!" }) &&
            t.isUnaryExpression(init.argument, { operator: "!" }) &&
            (isWindowTauri(init.argument.argument) || isTauriPlatform(init.argument.argument)));

        if (matches) {
          // remove this declarator (and declaration if empty)
          const parent = p.parentPath?.node;
          p.remove();
          if (t.isVariableDeclaration(parent) && parent.declarations.length === 0) {
            p.parentPath?.remove();
          }
          removedLocalIsTauriDecl = true;
          fileChanged = true;
        }
      }
    },
  });

  // Ensure import { isTauri } from "@/lib/db/sql"
  const addedImport = ensureIsTauriImport(ast);
  if (addedImport) fileChanged = true;

  if (fileChanged) {
    const out = generate(ast, { retainLines: true, jsescOption: { minimal: true } }, code).code;
    if (out !== code) {
      fs.writeFileSync(file, out, "utf8");
      changed++;
      changedFiles.push(path.relative(ROOT, file));
    }
  }
}

console.log(`\nCodemod isTauri summary: scanned=${scanned}, changed=${changed}`);
if (changedFiles.length) {
  const MAX = 20;
  const head = changedFiles.slice(0, MAX);
  for (const f of head) console.log("  •", f);
  if (changedFiles.length > MAX) console.log(`  • +${changedFiles.length - MAX} more...`);
}
if (errors.length) {
  console.warn("\nWarnings:");
  for (const m of errors) console.warn("  -", m);
}
