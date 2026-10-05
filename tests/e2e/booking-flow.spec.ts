import { expect, test } from "./base";
import { fillGuest, startBooking } from "./helpers";

test.describe("booking lifecycle (Terms §04)", () => {
  test("online stay: pending → accepted → pay → confirmed → completed → review; cancel is by phone", async ({ page }) => {
    await startBooking(page, "st-01", "st-01-a");

    // The payment mode is stated before the request is sent.
    await expect(page.getByText("Pay 30% online (KBZPay)").first()).toBeVisible();
    await expect(page.getByText("call the hotel", { exact: false }).first()).toBeVisible();

    await fillGuest(page);
    await page.getByRole("button", { name: "Send booking request" }).click();

    // Every booking starts as a pending REQUEST. Nothing is held.
    await expect(page.getByText("No room is held until the hotel accepts it.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay Ks/ })).toHaveCount(0);

    // The hotel accepts: an online stay now asks for payment with a deadline.
    await page.getByRole("button", { name: "Set status: Accepted" }).click();
    await expect(page.getByText(/Pay by \d{2}:\d{2}/)).toBeVisible();
    await page.getByRole("button", { name: /Pay Ks .* online \(mock KBZPay\)/ }).click();
    await expect(page.getByText("Payment received. Your room is confirmed.")).toBeVisible();

    // There is NO in-app cancel action: cancellation is by phone with the hotel.
    await expect(page.getByRole("button", { name: /cancel this booking/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Call \+95/ })).toBeVisible();

    // Reviews only appear once the stay is completed.
    await expect(page.getByRole("heading", { name: "How was your stay?" })).toHaveCount(0);
    await page.getByRole("button", { name: "Set status: Completed" }).click();
    await expect(page.getByRole("heading", { name: "How was your stay?" })).toBeVisible();
    await page.getByText("5", { exact: true }).first().click();
    await page.getByRole("button", { name: "Submit review" }).click();
    await expect(page.getByText("Thanks for your review")).toBeVisible();

    // Completed is final: no further moves.
    await expect(page.getByText("No further status changes are possible")).toBeVisible();
  });

  test("pay-at-hotel stay never asks for online payment", async ({ page }) => {
    await startBooking(page, "st-02", "st-02-a");
    await expect(page.getByText("Pay at hotel").first()).toBeVisible();
    await fillGuest(page);
    await page.getByRole("button", { name: "Send booking request" }).click();
    await page.getByRole("button", { name: "Set status: Accepted" }).click();
    await expect(page.getByText("Pay the hotel directly when you arrive.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay Ks/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Set status: Confirmed" })).toHaveCount(0); // no online-payment stage
  });

  test("a rejected request is final and offers a way forward", async ({ page }) => {
    await startBooking(page, "st-02", "st-02-b");
    await fillGuest(page);
    await page.getByRole("button", { name: "Send booking request" }).click();
    await page.getByRole("button", { name: "Set status: Rejected" }).click();
    await expect(page.getByText("No room was held and you weren't charged.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Find other stays for these dates" })).toBeVisible();
    await expect(page.getByText("No further status changes are possible")).toBeVisible();
  });

  test("validation: errors are inline, focus moves to the first problem, errors clear on edit", async ({ page }) => {
    await startBooking(page, "st-01", "st-01-b");
    await page.getByRole("button", { name: "Send booking request" }).click();
    await expect(page.getByText("Enter the guest's full name.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
    await page.getByLabel("Full name").fill("Mya Aye");
    await expect(page.getByText("Enter the guest's full name.")).toHaveCount(0);
  });

  test("coupon: valid applies, expired explains why and leaves price unchanged", async ({ page }) => {
    await startBooking(page, "st-01", "st-01-a");
    await page.getByLabel("Coupon code").fill("WELCOME10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("WELCOME10 applied.")).toBeVisible();
    await expect(page.getByText("Coupon discount").first()).toBeVisible();
    await page.getByLabel("Coupon code").fill("OLDDEAL");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("That coupon has expired.")).toBeVisible();
    await expect(page.getByText("Coupon discount")).toHaveCount(0);
  });
});
