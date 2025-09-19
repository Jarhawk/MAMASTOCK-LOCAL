import { test, expect } from "@playwright/test";

import { registerLocalAdmin } from "./helpers";

const ADMIN_PASSWORD = "TestAdmin1!";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@mamastock.local`;
}

test("accès direct à /legal/rgpd", async ({ page }) => {
  await page.goto("/#/legal/rgpd");
  await expect(page.getByRole("heading", { name: "Données & Confidentialité" })).toBeVisible();
  await expect(page).toHaveTitle("Données & Confidentialité - MamaStock");
  await expect(page.locator("main#content")).toBeVisible();
});

test("redirection legacy /rgpd", async ({ page }) => {
  await page.goto("/#/legal/cgu");
  const initialIdx = await page.evaluate(() => window.history.state?.idx ?? 0);
  await page.goto("/#/rgpd");
  await expect(page).toHaveURL(/#\/legal\/rgpd$/);
  const redirectedIdx = await page.evaluate(() => window.history.state?.idx ?? 0);
  expect(redirectedIdx).toBe(initialIdx);
});

test("route protégée redirige vers login puis revient après connexion", async ({ page, context }) => {
  const email = uniqueEmail("auth");
  await registerLocalAdmin(page, email, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/#\/dashboard$/);

  await page.evaluate(() => {
    localStorage.removeItem("auth.user");
  });
  await page.close();

  const session = await context.newPage();
  await session.goto("/#/dashboard");
  await expect(session).toHaveURL(/#\/login/);
  const redirectParam = await session.evaluate(() =>
    new URLSearchParams(window.location.search).get("redirectTo")
  );
  expect(redirectParam).toContain("/dashboard");

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

  await page.waitForSelector('a[href="#/accueil"]');
  await page.locator('a[href="#/accueil"]').click();
  await expect(page).toHaveURL(/#\/accueil$/);
  await page.evaluate(() => window.scrollTo(0, 320));
  await page.waitForTimeout(100);

  await page.locator('a[href="#/alertes"]').first().click();
  await expect(page).toHaveURL(/#\/alertes$/);
  await page.evaluate(() => window.scrollTo(0, 640));
  await page.waitForTimeout(100);

  await page.goBack();
  await expect(page).toHaveURL(/#\/accueil$/);
  const backScroll = await page.evaluate(() => window.scrollY);
  expect(backScroll).toBeGreaterThan(250);
  const accueilActive = await page
    .locator('a[href="#/accueil"]')
    .evaluate((el) => el.classList.contains("font-semibold"));
  expect(accueilActive).toBeTruthy();

  await page.goForward();
  await expect(page).toHaveURL(/#\/alertes$/);
  const forwardScroll = await page.evaluate(() => window.scrollY);
  expect(forwardScroll).toBeGreaterThan(500);
  const alertesActive = await page
    .locator('a[href="#/alertes"]').first()
    .evaluate((el) => el.classList.contains("font-semibold"));
  expect(alertesActive).toBeTruthy();
});
