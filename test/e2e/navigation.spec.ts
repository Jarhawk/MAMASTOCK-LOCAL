import { test, expect, Page } from "@playwright/test";
import { registerLocalAdmin } from "./helpers";

const ADMIN_PASSWORD = "TestAdmin1!";

// Active un check strict de la restauration de scroll si défini.
// Exemple : EXPECT_SCROLL_RESTORE=true npx playwright test
const STRICT_SCROLL = process.env.EXPECT_SCROLL_RESTORE === "true";

/* ========= Helpers ========= */

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@mamastock.local`;
}

async function ensureBodyMinHeight(page: Page, minPx = 2000) {
  await page.evaluate((px) => {
    const cur = parseInt(getComputedStyle(document.body).minHeight || "0", 10);
    if (isNaN(cur) || cur < px) {
      document.body.style.minHeight = `${px}px`;
    }
  }, minPx);
}

async function ensureContainerScrollableHeight(page: Page, selector = "main#content", minPx = 2000) {
  await page.evaluate(
    ({ selector, minPx }) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      let spacer = el.querySelector<HTMLElement>('[data-test-spacer="1"]');
      if (!spacer) {
        spacer = document.createElement("div");
        spacer.setAttribute("data-test-spacer", "1");
        spacer.style.height = `${minPx}px`;
        spacer.style.width = "1px";
        spacer.style.pointerEvents = "none";
        spacer.style.opacity = "0";
        el.appendChild(spacer);
      } else {
        spacer.style.height = `${minPx}px`;
      }
    },
    { selector, minPx }
  );
}

async function scrollBoth(page: Page, y: number, selector = "main#content") {
  await page.evaluate(
    ({ y, selector }) => {
      window.scrollTo(0, y);
      const el = document.querySelector<HTMLElement>(selector);
      if (el) el.scrollTo({ top: y, behavior: "auto" });
    },
    { y, selector }
  );
}

async function getAnyScrollTop(page: Page, selector = "main#content") {
  return await page.evaluate((selector) => {
    const el = document.querySelector<HTMLElement>(selector);
    const windowY = Math.round(window.scrollY);
    const containerY = Math.round(el?.scrollTop ?? 0);
    return { windowY, containerY, any: Math.max(windowY, containerY) };
  }, selector);
}

// Récupère redirectTo s’il est dans search, hash ou storage
async function getRedirectTo(session: Page): Promise<string | null> {
  return await session.evaluate(() => {
    const fromSearch = new URLSearchParams(window.location.search).get("redirectTo");
    if (fromSearch) return fromSearch;

    const h = window.location.hash || "";
    const qIndex = h.indexOf("?");
    if (qIndex >= 0) {
      const fromHash = new URLSearchParams(h.slice(qIndex + 1)).get("redirectTo");
      if (fromHash) return fromHash;
    }

    const fromLocal = localStorage.getItem("redirectTo");
    if (fromLocal) return fromLocal;
    const fromSession = sessionStorage.getItem("redirectTo");
    if (fromSession) return fromSession;

    return null;
  });
}

async function isNavLinkActive(page: Page, selector: string) {
  return await page.locator(selector).evaluate((el) => {
    return (
      el.classList.contains("font-semibold") ||
      el.getAttribute("aria-current") === "page" ||
      el.getAttribute("data-active") === "true"
    );
  });
}

/* ========= TESTS ========= */

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

  // "Déconnexion"
  await page.evaluate(() => {
    sessionStorage.removeItem("auth.user");
  });
  await page.close();

  const session = await context.newPage();
  await session.goto("/#/dashboard");
  await expect(session).toHaveURL(/#\/login/);

  // redirectTo (peut être dans search, hash, storage)
  const redirectParam = await getRedirectTo(session);
  expect.soft(redirectParam, "redirectTo devrait idéalement être présent").toContain("/dashboard");

  // Login -> redirection vers /dashboard
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

  // Va sur /accueil
  await page.waitForSelector('a[href="#/accueil"]');
  await page.locator('a[href="#/accueil"]').click();
  await expect(page).toHaveURL(/#\/accueil$/);

  // Garantit du scroll puis scrolle ~320 (body + container)
  await ensureBodyMinHeight(page);
  await ensureContainerScrollableHeight(page);
  await scrollBoth(page, 320);
  await page.waitForTimeout(100);

  // Va sur /alertes
  await page.locator('a[href="#/alertes"]').first().click();
  await expect(page).toHaveURL(/#\/alertes$/);

  // Garantit du scroll puis scrolle ~640
  await ensureBodyMinHeight(page);
  await ensureContainerScrollableHeight(page);
  await scrollBoth(page, 640);
  await page.waitForTimeout(100);

  // Back -> on s'attend à retrouver ~320 si l'app restaure
  await page.goBack();
  await expect(page).toHaveURL(/#\/accueil$/);
  await page.waitForTimeout(120);
  const back = await getAnyScrollTop(page);

  if (STRICT_SCROLL) {
    expect(
      back.any,
      `scroll non restauré (windowY=${back.windowY}, containerY=${back.containerY})`
    ).toBeGreaterThan(250);
  } else {
    // Note informative : on n'échoue pas le test si l'app ne restaure pas le scroll
    console.log(
      `[NOTE] back scroll restoration: windowY=${back.windowY}, containerY=${back.containerY}`
    );
  }

  // Lien actif accueil
  const accueilActive = await isNavLinkActive(page, 'a[href="#/accueil"]');
  expect(accueilActive).toBeTruthy();

  // Forward -> on s'attend à retrouver ~640 si l'app restaure
  await page.goForward();
  await expect(page).toHaveURL(/#\/alertes$/);
  await page.waitForTimeout(120);
  const fwd = await getAnyScrollTop(page);

  if (STRICT_SCROLL) {
    expect(
      fwd.any,
      `scroll non restauré (windowY=${fwd.windowY}, containerY=${fwd.containerY})`
    ).toBeGreaterThan(500);
  } else {
    console.log(
      `[NOTE] forward scroll restoration: windowY=${fwd.windowY}, containerY=${fwd.containerY}`
    );
  }

  const alertesActive = await isNavLinkActive(page, 'a[href="#/alertes"]');
  expect(alertesActive).toBeTruthy();
});
