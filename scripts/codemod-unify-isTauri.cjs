"use strict";
/**
 * Codemod autonome (CommonJS) qui remplace toutes les variantes de détection Tauri
 * (window.__TAURI__, globalThis.__TAURI__, import.meta.env.TAURI_PLATFORM, typeof window !== 'undefined' && ...)
 * par un import unique:
 *    import { isTauri } from "@/lib/db/sql";
 *
 * Il s'assure aussi d'ajouter cet import si absent.
 */

const fs = require("node:fs");
const path = require("node:path");
const fg = require("fast-glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const SKIP_PREFIXES = [
  path.join(ROOT, "src-tauri"),
  path.join(ROOT, "node_modules"),
  path.join(ROOT, "dist"),
  path.join(ROOT, "build"),
  path.join(ROOT, "reports"),
  path.join(ROOT, "var"),
];

function isSkipped(file) {
  const n = path.normalize(file);
  return SKIP_PREFIXES.some((p) => n.startsWith(path.normalize(p)));
}

const files = fg.sync("src/**/*.{js,jsx,ts,tsx}", {
  cwd: ROOT,
  absolute: true,
  dot: false,
  followSymbolicLinks: true,
});

function ensureIsTauriImport(ast) {
  const body = ast.program.body;
  let importDecl = null;
  let lastImportIndex = -1;

  for (let i = 0; i < body.length; i++) {
    const node = body[i];
    if (t.isImportDeclaration(node)) {
      lastImportIndex = i;
      if (t.isStringLiteral(node.source, { value: "@/lib/db/sql" })) {
        importDecl = node;
      }
    }
  }

  if (importDecl) {
    const hasIsTauri = importDecl.specifiers?.some(
      (s) => t.isImportSpecifier(s) && t.isIdentifier(s.imported, { name: "isTauri" })
    );
    if (!hasIsTauri) {
      importDecl.specifiers.push(
        t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))
      );
      return true;
    }
    return false;
  } else {
    const newImport = t.importDeclaration(
      [t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))],
      t.stringLiteral("@/lib/db/sql")
    );
    const insertAt = lastImportIndex >= 0 ? lastImportIndex + 1 : 0;
    body.splice(insertAt, 0, newImport);
    return true;
  }
}

// Helpers de détection de patterns
function isWindowOrGlobalThis(node) {
  return t.isIdentifier(node, { name: "window" }) || t.isIdentifier(node, { name: "globalThis" });
}
function isWindowTauri(node) {
  return (
    t.isMemberExpression(node) &&
    isWindowOrGlobalThis(node.object) &&
    (
      (t.isIdentifier(node.property, { name: "__TAURI__" }) && !node.computed) ||
      (t.isStringLiteral(node.property, { value: "__TAURI__" }) && node.computed)
    )
  );
}
function isImportMeta(node) {
  return t.isMetaProperty(node) &&
    t.isIdentifier(node.meta, { name: "import" }) &&
    t.isIdentifier(node.property, { name: "meta" });
}
function isImportMetaEnv(node) {
  return t.isMemberExpression(node) && isImportMeta(node.object) &&
    t.isIdentifier(node.property, { name: "env" }) && !node.computed;
}
function isTauriPlatform(node) {
  return t.isMemberExpression(node) && isImportMetaEnv(node.object) &&
    (
      (t.isIdentifier(node.property, { name: "TAURI_PLATFORM" }) && !node.computed) ||
      (t.isStringLiteral(node.property, { value: "TAURI_PLATFORM" }) && node.computed)
    );
}
function isTypeof(expr, inner) {
  return t.isUnaryExpression(expr, { operator: "typeof" }) && expr.argument && inner(expr.argument);
}
function isTypeofWindow(expr) {
  return isTypeof(expr, (n) => t.isIdentifier(n, { name: "window" }));
}
function isUndefinedLiteral(n) {
  return t.isStringLiteral(n, { value: "undefined" }) || t.isIdentifier(n, { name: "undefined" });
}
function isTypeofWindowNotUndefined(node) {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!=" || node.operator === "!==") &&
    isTypeofWindow(node.left) &&
    isUndefinedLiteral(node.right)
  );
}
function isTypeofWindowTauri(expr) {
  return isTypeof(expr, (n) => isWindowTauri(n));
}
function isTypeofWindowTauriNotUndefined(node) {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!=" || node.operator === "!==") &&
    isTypeofWindowTauri(node.left) &&
    isUndefinedLiteral(node.right)
  );
}

function replaceWithIsTauri(path) {
  path.replaceWith(t.identifier("isTauri"));
}

let scanned = 0;
let changed = 0;
const changedFiles = [];
const warnings = [];

// On ne modifie JAMAIS ce fichier lui-même.
const forbid = path.join(SRC, "lib", "db", "sql.ts");

for (const file of files) {
  if (isSkipped(file)) continue;
  if (path.normalize(file) === path.normalize(forbid)) continue;

  let code;
  try {
    code = fs.readFileSync(file, "utf8");
  } catch (e) {
    warnings.push(`read fail ${file}: ${e.message}`);
    continue;
  }

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "classProperties", "importMeta", "topLevelAwait", "decorators-legacy"],
    });
  } catch (e) {
    warnings.push(`parse fail ${file}: ${e.message}`);
    continue;
  }

  scanned++;
  let fileChanged = false;

  traverse(ast, {
    // Pattern: (typeof window !== "undefined") && (window.__TAURI__ || import.meta.env.TAURI_PLATFORM)
    LogicalExpression(p) {
      const n = p.node;
      if (n.operator !== "&&") return;
      const L = n.left;
      const R = n.right;
      if (isTypeofWindowNotUndefined(L) && (isWindowTauri(R) || isTauriPlatform(R))) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },
    // Pattern: typeof window.__TAURI__ !== "undefined"
    BinaryExpression(p) {
      if (isTypeofWindowTauriNotUndefined(p.node)) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },
    // Mentions directes: window.__TAURI__, globalThis.__TAURI__, import.meta.env.TAURI_PLATFORM
    MemberExpression(p) {
      if (isWindowTauri(p.node) || isTauriPlatform(p.node)) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },
    // !!isTauri => isTauri
    UnaryExpression(p) {
      const n = p.node;
      if (n.operator === "!" && t.isUnaryExpression(n.argument, { operator: "!" }) &&
          t.isIdentifier(n.argument.argument, { name: "isTauri" })) {
        replaceWithIsTauri(p);
        fileChanged = true;
      }
    },
    // var isTauri = ... (définitions locales obsolètes) -> supprimer
    VariableDeclarator(p) {
      const n = p.node;
      if (!t.isIdentifier(n.id, { name: "isTauri" }) || !n.init) return;
      const init = n.init;

      const matches =
        isWindowTauri(init) ||
        isTauriPlatform(init) ||
        isTypeofWindowNotUndefined(init) ||
        isTypeofWindowTauriNotUndefined(init) ||
        (t.isUnaryExpression(init, { operator: "!" }) &&
          t.isUnaryExpression(init.argument, { operator: "!" }) &&
          (isWindowTauri(init.argument.argument) || isTauriPlatform(init.argument.argument)));

      if (matches) {
        const parent = p.parentPath.node;
        p.remove();
        if (t.isVariableDeclaration(parent) && parent.declarations.length === 0) {
          p.parentPath.remove();
        }
        fileChanged = true;
      }
    },
  });

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
  const MAX = 30;
  for (const f of changedFiles.slice(0, MAX)) console.log("  •", f);
  if (changedFiles.length > MAX) console.log(`  • +${changedFiles.length - MAX} more...`);
}
if (warnings.length) {
  console.warn("\nWarnings:");
  for (const m of warnings.slice(0, 30)) console.warn("  -", m);
  if (warnings.length > 30) console.warn(`  - +${warnings.length - 30} more...`);
}
