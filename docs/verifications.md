# Vérifications transverses

## 1. Scan anti-bypass

```diff
commit 507a171f592d609affa6070ab78b6f0c4a5472e4
@@
-import { useAuth } from "@/context/AuthContext";
-import { devFlags } from "@/lib/devFlags";
-
-// Simple gate : en local, on autorise tout (fini les “Accès refusé”)
-export default function AccessGate({ children }: { children: React.ReactNode }) {
-  const { user, access_rights } = useAuth();
-  if (devFlags.isDev) return <>{children}</>;
+import { buildRedirectHash, setRedirectTo } from "@/auth/redirect";
+import useAuth from "@/hooks/useAuth";
+
+export default function AccessGate({ children }: { children: React.ReactNode }) {
+  const { status, user, access_rights } = useAuth();
+  const location = useLocation();
+  const redirectHash = useMemo(() => buildRedirectHash(location), [location]);
+  const loginTarget = useMemo(
+    () => ({
+      pathname: "/login",
+      search: `?redirectTo=${encodeURIComponent(redirectHash)}`,
+    }),
+    [redirectHash]
+  );
```

Le garde commun conserve la redirection et renvoie systématiquement les utilisateurs non authentifiés vers `/#/login?redirectTo=…` via `<Navigate />` :

```tsx
if (status !== "authenticated") {
  return <Navigate to={loginTarget} replace />;
}
```

Le même schéma est appliqué dans `ProtectedRoute.jsx` et `auth/RequireAuth.jsx`, chaque garde mémorisant le hash avant de déclencher la redirection.

## 2. Session only

La recherche de `localStorage` dans l’auth/session est désormais vide (remplacement par `sessionStore`) :

```
$ rg "localStorage" src/auth src/lib/auth
```

Les identifiants, jetons, redirections et indicateurs de first-run ne transitent plus que par `sessionStore`, wrapper autour de `sessionStorage` :

```ts
export function writeStoredUser(value: unknown | null): void {
  if (value == null) {
    sessionStore.remove(AUTH_USER_KEY);
    return;
  }
  writeJSON(AUTH_USER_KEY, value);
}

export function writeStoredToken(token: string | null): void {
  if (!token) {
    sessionStore.remove(AUTH_TOKEN_KEY);
    return;
  }
  sessionStore.set(AUTH_TOKEN_KEY, token);
}

export function writeStoredRedirect(value: string | null): void {
  if (!value) {
    sessionStore.remove(AUTH_REDIRECT_KEY);
    return;
  }
  sessionStore.set(AUTH_REDIRECT_KEY, value);
}
```

Le stockage navigateur du module `localAccount.ts` s’appuie également sur le même wrapper (`sessionStore.set/get`) pour l’implémentation mémoire utilisée en dehors de Tauri.

## 3. Router unique

```diff
commit 9703d5a77c37ff2ec3b77baa6bd2ef6a05c3303b
@@
-import React from "react";
-import ReactDOM from "react-dom/client";
+import { StrictMode } from "react";
+import { createRoot } from "react-dom/client";
 import { RouterProvider } from "react-router-dom";
 
 import appRouter from "@/router";
 import { AuthProvider } from "@/hooks/useAuth";
@@
-const root = ReactDOM.createRoot(container);
-
-root.render(
-  <React.StrictMode>
-    <AuthProvider>
-      <RouterProvider router={appRouter} />
-    </AuthProvider>
-  </React.StrictMode>
-);
+createRoot(container).render(
+  <StrictMode>
+    <AuthProvider>
+      <RouterProvider router={appRouter} />
+    </AuthProvider>
+  </StrictMode>
+);
```

Le point d’entrée ne déclare plus de mini-router inline : seul `RouterProvider` reçoit `appRouter`, enveloppé par `AuthProvider`.

## 4. Navigation & analytics

La sidebar auto-générée conserve une seule entrée `#/accueil` et supprime les doublons grâce à un `Set` :

```ts
const RAW_LINKS = [
  { to: "/debug/accessexample", label: "Access Example" },
  { to: "/consolidation/accessmultisites", label: "Access Multi Sites" },
  { to: "/parametrage/accessrights", label: "Access Rights" },
  { to: "/accueil", label: "Accueil" },
  …
];

const SIDEBAR_LINKS = (() => {
  const seen = new Set();
  const deduped = [];
  for (const link of RAW_LINKS) {
    if (seen.has(link.to)) continue;
    seen.add(link.to);
    deduped.push(link);
  }
  return deduped;
})();
```

Le module d’analytics n’attache plus de listener au chargement du module : l’enregistrement est effectué par le hook `useAnalyticsNavigationListener`, lequel s’appuie sur `addNavigationAnalyticsListener()` pour gérer l’abonnement et le nettoyage.

## 5. Base de données locale

```
$ rg "supabase" src
```

Le test de l’adaptateur local confirme l’exécution CRUD en mémoire :

```
$ npx vitest run test/db/local-adapter.spec.ts
 RUN  v1.6.1 /workspace/MAMASTOCK-LOCAL
 ✓ test/db/local-adapter.spec.ts (1)
   ✓ local adapter executes CRUD operations in memory
```

## 6. Build & tests

```
$ CI=1 npx tsc --noEmit --pretty false
```

(TypeScript ne renvoie aucune erreur bloquante.)

```
$ npm run build
> mamastock.com@0.0.0 build
> vite build --logLevel silent
```

(Build silencieux sans sortie d’erreur.)

```
$ npx playwright test test/e2e/navigation.spec.ts --reporter=line
Running 6 tests using 1 worker
…
Error: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
  6 failed … (navigate, skip-link, back/forward)
```

(Les scénarios Playwright échouent dans le conteneur faute de navigateurs installés.)
