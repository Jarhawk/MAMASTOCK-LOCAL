import type { Page } from "@playwright/test";

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
