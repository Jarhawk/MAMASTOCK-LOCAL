import type { Page } from "@playwright/test";

type GotoOptions = Parameters<Page["goto"]>[1];

export async function gotoAndWaitTitle(
  page: Page,
  url: string,
  expectedTitle: string,
  options?: GotoOptions
) {
  await page.goto(url, options);
  await page.waitForFunction(
    (title) => document.title === title,
    expectedTitle
  );
}

export async function loginAs(page: Page, role: string) {
  const payload = {
    id: "e2e-user",
    email: `${role}@mamastock.test`,
    mama_id: "e2e-mama",
    role
  };

  await page.addInitScript(([user]) => {
    try {
      window.localStorage.setItem("auth.user", JSON.stringify(user));
    } catch {}
  }, [payload]);

  await page.evaluate(([user]) => {
    try {
      localStorage.setItem("auth.user", JSON.stringify(user));
    } catch {}
  }, [payload]);
}

export async function registerLocalAdmin(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/#/setup");
  await page.fill("#setup-email", email);
  await page.fill("#setup-password", password);
  await page.fill("#setup-password-confirm", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/#\/(dashboard|accueil)/);
}
