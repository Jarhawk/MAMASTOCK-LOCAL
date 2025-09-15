import fs from "fs";
import path from "path";
import glob from "glob";
import * as parser from "@babel/parser";
import traverseModule from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import generatorModule from "@babel/generator";
import * as t from "@babel/types";

const traverse = (traverseModule as any).default || (traverseModule as any);
const generate = (generatorModule as any).default || (generatorModule as any);

const files = glob.sync("src/**/*.{js,jsx,ts,tsx}", {
  nodir: true,
  ignore: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/reports/**",
    "**/src-tauri/**",
  ],
});

let scanned = 0;
const changedFiles: string[] = [];

function isWindowTauri(node: t.Node): boolean {
  return (
    t.isMemberExpression(node) &&
    !node.computed &&
    t.isIdentifier(node.property, { name: "__TAURI__" }) &&
    (t.isIdentifier(node.object, { name: "window" }) ||
      t.isIdentifier(node.object, { name: "globalThis" }))
  );
}

function isImportMetaTauri(node: t.Node): boolean {
  return (
    t.isMemberExpression(node) &&
    !node.computed &&
    t.isIdentifier(node.property) &&
    node.property.name.startsWith("TAURI_") &&
    t.isMemberExpression(node.object) &&
    t.isIdentifier(node.object.property, { name: "env" }) &&
    t.isMetaProperty(node.object.object) &&
    node.object.object.meta.name === "import" &&
    node.object.object.property.name === "meta"
  );
}

function isDoubleNotImportMeta(node: t.Node): boolean {
  return (
    t.isUnaryExpression(node, { operator: "!" }) &&
    t.isUnaryExpression(node.argument, { operator: "!" }) &&
    isImportMetaTauri(node.argument.argument)
  );
}

function isTypeofWindowUndefined(node: t.Node): boolean {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!==" || node.operator === "!=") &&
    t.isUnaryExpression(node.left, { operator: "typeof" }) &&
    t.isIdentifier(node.left.argument, { name: "window" }) &&
    t.isStringLiteral(node.right, { value: "undefined" })
  );
}

function isTypeofWindowTauriUndefined(node: t.Node): boolean {
  return (
    t.isBinaryExpression(node) &&
    (node.operator === "!==" || node.operator === "!=") &&
    t.isUnaryExpression(node.left, { operator: "typeof" }) &&
    isWindowTauri(node.left.argument) &&
    t.isStringLiteral(node.right, { value: "undefined" })
  );
}

function matchesTauriChain(node: t.Expression): boolean {
  if (
    isWindowTauri(node) ||
    isImportMetaTauri(node) ||
    isDoubleNotImportMeta(node) ||
    isTypeofWindowTauriUndefined(node)
  ) {
    return true;
  }
  if (t.isLogicalExpression(node)) {
    const left = matchesTauriChain(node.left) || isTypeofWindowUndefined(node.left);
    const right =
      matchesTauriChain(node.right) || isTypeofWindowUndefined(node.right);
    return left && right;
  }
  return false;
}

function isBooleanContext(path: NodePath<t.MemberExpression>): boolean {
  const parent = path.parentPath;
  if (!parent) return false;
  return (
    (parent.isIfStatement() && parent.node.test === path.node) ||
    (parent.isConditionalExpression() && parent.node.test === path.node) ||
    (parent.isWhileStatement() && parent.node.test === path.node) ||
    (parent.isDoWhileStatement() && parent.node.test === path.node) ||
    (parent.isForStatement() && parent.node.test === path.node) ||
    parent.isLogicalExpression() ||
    (parent.isUnaryExpression({ operator: "!" }) && parent.node.argument === path.node)
  );
}

for (const file of files) {
  if (path.normalize(file) === path.normalize("src/lib/db/sql.ts")) continue;
  scanned++;
  try {
    const code = fs.readFileSync(file, "utf8");
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "importMeta",
        "classProperties",
        "topLevelAwait",
      ],
    });

    let changed = false;
    let importDecl: NodePath<t.ImportDeclaration> | null = null;
    let hasIsTauriImport = false;

    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === "@/lib/db/sql") {
          importDecl = path;
          if (
            path.node.specifiers.some(
              (s) =>
                t.isImportSpecifier(s) &&
                t.isIdentifier(s.imported, { name: "isTauri" })
            )
          ) {
            hasIsTauriImport = true;
          }
        }
      },
      VariableDeclarator(path) {
        if (
          t.isIdentifier(path.node.id, { name: "isTauri" }) &&
          path.node.init &&
          t.isExpression(path.node.init) &&
          matchesTauriChain(path.node.init)
        ) {
          path.remove();
          changed = true;
        }
      },
      MemberExpression(path) {
        if (isWindowTauri(path.node)) {
          path.replaceWith(t.identifier("isTauri"));
          changed = true;
          return;
        }
        if (isImportMetaTauri(path.node) && isBooleanContext(path)) {
          path.replaceWith(t.identifier("isTauri"));
          changed = true;
        }
      },
      UnaryExpression(path) {
        if (isDoubleNotImportMeta(path.node)) {
          path.replaceWith(t.identifier("isTauri"));
          changed = true;
        } else if (
          path.node.operator === "!" &&
          isImportMetaTauri(path.node.argument)
        ) {
          path.replaceWith(t.unaryExpression("!", t.identifier("isTauri")));
          changed = true;
        }
      },
      BinaryExpression(path) {
        if (isTypeofWindowTauriUndefined(path.node)) {
          path.replaceWith(t.identifier("isTauri"));
          changed = true;
        }
      },
      LogicalExpression(path) {
        if (matchesTauriChain(path.node)) {
          path.replaceWith(t.identifier("isTauri"));
          changed = true;
        }
      },
    });

    traverse(ast, {
      VariableDeclaration(path) {
        if (path.node.declarations.length === 0) path.remove();
      },
    });

    let usesIsTauri = false;
    traverse(ast, {
      Identifier(path) {
        if (path.node.name === "isTauri") {
          if (
            !t.isImportSpecifier(path.parent) &&
            !t.isImportDefaultSpecifier(path.parent) &&
            !t.isImportNamespaceSpecifier(path.parent) &&
            !t.isImportDeclaration(path.parent)
          ) {
            usesIsTauri = true;
          }
        }
      },
    });

    if (usesIsTauri) {
      if (importDecl) {
        if (!hasIsTauriImport) {
          importDecl.node.specifiers.push(
            t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))
          );
          changed = true;
        }
      } else {
        const newImport = t.importDeclaration(
          [t.importSpecifier(t.identifier("isTauri"), t.identifier("isTauri"))],
          t.stringLiteral("@/lib/db/sql")
        );
        const body = ast.program.body;
        let lastImportIndex = -1;
        for (let i = 0; i < body.length; i++) {
          if (t.isImportDeclaration(body[i])) lastImportIndex = i;
        }
        body.splice(lastImportIndex + 1, 0, newImport);
        changed = true;
      }
    }

    if (changed) {
      const output = generate(ast, { retainLines: false, compact: false }, code);
      fs.writeFileSync(file, output.code);
      changedFiles.push(file);
      console.log("updated", file);
    }
  } catch (err) {
    console.error("Error processing", file, err);
  }
}

console.log(`Files scanned: ${scanned}`);
console.log(`Files changed: ${changedFiles.length}`);
if (changedFiles.length) {
  const list = changedFiles.slice(0, 20);
  for (const f of list) console.log(" -", f);
  if (changedFiles.length > 20)
    console.log(` +${changedFiles.length - 20} more...`);
}
