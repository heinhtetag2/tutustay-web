import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";
import type { Page } from "@playwright/test";
import { fillGuest, startBooking } from "./helpers";

/** WCAG 2.2 A/AA automated checks. Fails on serious or critical issues. Automated checks catch ~a third of problems:
 * keyboard and screen-reader walkthroughs are still needed (docs/05). */
async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target.join(" ")}`), label).toEqual([]);
}

const PAGES = [
  "/en", "/en/search", "/en/search?view=grid", "/en/search?view=map", "/en/stays/st-01", "/en/stays/st-06?checkIn=2026-12-24&checkOut=2026-12-26",
  "/en/login", "/en/deals", "/en/destinations", "/en/about", "/en/guide", "/en/help", "/en/help/faq", "/en/help/contact",
  "/en/partners", "/en/partners/apply", "/en/legal/terms", "/en/legal/privacy", "/en/legal/cookies", "/en/legal/location", "/en/signup", "/en/forgot-password", "/en/download", "/en/dev/kitchen-sink",
];

for (const path of PAGES) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await audit(page, path);
  });
}

test("a11y: review step, booking status and photo dialog", async ({ page }) => {
  await startBooking(page, "st-01", "st-01-a");
  await audit(page, "review step");
  await page.getByRole("button", { name: "Send booking request" }).click(); // shows validation errors
  await expect(page.getByText("Enter the guest's full name.")).toBeVisible();
  await audit(page, "review step with errors");
  await fillGuest(page);
  await page.getByRole("button", { name: "Send booking request" }).click();
  await expect(page.getByText("No room is held")).toBeVisible();
  await audit(page, "booking status");
  await page.getByRole("button", { name: "Set status: Accepted" }).click();
  await audit(page, "booking status accepted");

  await page.goto("/en/stays/st-01");
  await page.getByRole("button", { name: "Show all photos" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(450); // let the open animation finish: axe would measure contrast mid-fade
  await audit(page, "photo dialog");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("keyboard: skip link is first and reaches main content", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
