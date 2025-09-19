import { test, expect, Page } from "@playwright/test";
import { registerLocalAdmin } from "./helpers";

const ADMIN_PASSWORD = "TestAdmin1!";

/** Génère un email unique pour éviter les collisions en CI */
function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@mamastock.local`;
}

/** Lit un paramètre de query soit dans window.location.search, soit dans le hash (HashRouter) */
async function readRedirectParamInHashOrSearch(page: Page, key = "redirectTo") {
  return page.evaluate((k) => {
    // 1) classique: ?a=b hors hash
    if (window.location.search) {
      const p = new URLSearchParams(window.location.search);
      const v = p.get(k);
      if (v) return v;
    }
    // 2) HashRouter: ?a=b à l'intérieur du fragment
    const hash = window.location.hash || "";
    const qIndex = hash.indexOf("?");
    if (qIndex === -1) return null;
    const p2 = new URLSearchParams(hash.slice(qIndex + 1));
    return p2.get(k);
  }, key);
}

/** Ajoute un gros spacer pour garantir un vrai scroll en headless */
async function ensureScrollableHeight(page: Page, minHeight = 2000) {
  await page.evaluate((h) => {
    const existing = document.querySelector('[data-test-spacer="1"]');
    if (existing) return;
    const spacer = document.createElement("div");
    spacer.style.height = `${h}px`;
    spacer.setAttribute("data-test-spacer", "1");
    document.body.appendChild(spacer);
  }, minHeight);
}

/* ===================== Tests ===================== */

test("accès direct à /legal/rgpd", async ({ page }) => {
  await page.goto("/#/legal/rgpd");
  await expect(page.getByRole("heading", { name: "Données & Confidentialité" })).toBeVisible();
  await expect(page).toHaveTitle("Données & Confidentialité - MamaStock");
  await expect(page.locator("main#content")).toBeVisible();
});

test("redirection legacy /rgpd", async ({ page }) => {
  // Se place sur une autre page pour pouvoir comparer l'idx (on veut un replace, pas un push)
  await page.goto("/#/legal/cgu");
  const initialIdx = await page.evaluate(() => window.history.state?.idx ?? 0);

  await page.goto("/#/rgpd");
  await expect(page).toHaveURL(/#\/legal\/rgpd$/);

  const redirectedIdx = await page.evaluate(() => window.history.state?.idx ?? 0);
  expect(redirectedIdx).toBe(initialIdx); // replace OK
});

test("route protégée redirige vers login puis revient après connexion", async ({ page, context }) => {
  const email = uniqueEmail("auth");
  await registerLocalAdmin(page, email, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/#\/dashboard$/);

  // Simule la fin de session locale
  await page.evaluate(() => {
    localStorage.removeItem("auth.user");
  });
  await page.close();

  const session = await context.newPage();
  await session.goto("/#/dashboard");
  await expect(session).toHaveURL(/#\/login/);

  // Lis le redirectTo peu importe s'il est dans search ou dans le hash
  const redirectParam = await readRedirectParamInHashOrSearch(session, "redirectTo");
  expect(redirectParam).not.toBeNull();
  expect(redirectParam!).toContain("/dashboard");

  await session.fill("#login-email", email);
  await session.fill("#login-password", ADMIN_PASSWORD);
  await session.click('button[type="submit"]');

  await expect(session).toHaveURL(/#\/dashboard$/);
});

test("page inconnue affiche la 404", async ({ page }) => {
  await page.goto("/#/definitivement-introuvable");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page).toHaveTitle("Page non trouvée - MamaStock");
});

test("le skip link focalise le contenu principal", async ({ page }) => {
  await page.goto("/#/legal/cgu");
  await page.waitForSelector('a[href="#content"]');
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  const focusedId = await page.evaluate(() => document.activeElement?.id || "");
  expect(focusedId).toBe("content");
});

test("back/forward conserve le scroll et l’état actif des liens", async ({ page }) => {
  const email = uniqueEmail("nav");
  await registerLocalAdmin(page, email, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/#\/dashboard$/);

  // Va sur accueil via la nav (meilleure simulation utilisateur)
  await page.waitForSelector('a[href="#/accueil"]');
  await page.locator('a[href="#/accueil"]').click();
  await expect(page).toHaveURL(/#\/accueil$/);

  // Garantit de la hauteur puis scroll
  await ensureScrollableHeight(page, 2000);
  await page.evaluate(() => window.scrollTo(0, 320));
  await page.waitForTimeout(100);

  // Va sur /alertes via la nav
  const alertesLink = page.locator('a[href="#/alertes"]').first();
  await alertesLink.click();
  await expect(page).toHaveURL(/#\/alertes$/);

  // Garantit de la hauteur puis scroll un peu plus bas
  await ensureScrollableHeight(page, 2000);
  await page.evaluate(() => window.scrollTo(0, 640));
  await page.waitForTimeout(100);

  // Back -> le scroll de /accueil doit être restauré
  await page.goBack();
  await expect(page).toHaveURL(/#\/accueil$/);
  await page.waitForTimeout(50); // laisse le temps au restore
  const backScroll = await page.evaluate(() => Math.round(window.scrollY));
  expect(backScroll).toBeGreaterThan(250);

  // Lien actif accueil (tolérant: classe tailwind OU aria-current=page)
  const accueilActive = await page
    .locator('a[href="#/accueil"]')
    .evaluate((el) => el.classList.contains("font-semibold") || el.getAttribute("aria-current") === "page");
  expect(accueilActive).toBeTruthy();

  // Forward -> on retrouve /alertes avec le scroll restauré
  await page.goForward();
  await expect(page).toHaveURL(/#\/alertes$/);
  await page.waitForTimeout(50);
  const forwardScroll = await page.evaluate(() => Math.round(window.scrollY));
  expect(forwardScroll).toBeGreaterThan(500);

  const alertesActive = await page
    .locator('a[href="#/alertes"]').first()
    .evaluate((el) => el.classList.contains("font-semibold") || el.getAttribute("aria-current") === "page");
  expect(alertesActive).toBeTruthy();
});
