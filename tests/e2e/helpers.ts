import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page) {
  await page.getByLabel("Email", { exact: false }).first().fill("tester@example.test");
  await page.getByLabel(/^Password/).fill("mockpass1");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
}

/** Opens the review step for a given stay/room, signing in through the gate. */
export async function startBooking(page: Page, stayId: string, roomId: string, query = "checkIn=2026-12-01&checkOut=2026-12-03") {
  await page.goto(`/en/stays/${stayId}/book?${query}&room=${roomId}`);
  await expect(page.getByRole("heading", { name: "Sign in to continue" })).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).last().click();
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Review your booking" })).toBeVisible();
}

export async function fillGuest(page: Page) {
  await page.getByLabel("Full name").fill("Test Guest");
  await page.getByLabel("Phone number").fill("+95 9 000 111 222");
  await page.getByLabel(/I agree to the terms/).check();
}
