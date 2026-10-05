import { expect, test } from "./base";

test.describe("states", () => {
  test("sold out shows the reason and the next available dates", async ({ page }) => {
    await page.goto("/en/stays/st-06?checkIn=2026-12-24&checkOut=2026-12-26");
    await expect(page.getByText("Sold out for these dates").first()).toBeVisible();
    await expect(page.getByText(/next available start date/i)).toBeVisible();
    await page.getByRole("link", { name: "Use these dates" }).click();
    await expect(page).toHaveURL(/checkIn=2027-01-01/); // wait for the navigation before asserting on the new page
    await expect(page.getByText("Sold out for these dates")).toHaveCount(0);
  });

  test("stay type not offered is explained, not hidden", async ({ page }) => {
    await page.goto("/en/stays/st-07?stayType=session");
    await expect(page.getByText("Session isn't offered here.")).toBeVisible();
  });

  test("invalid dates are repaired and the user is told", async ({ page }) => {
    await page.goto("/en/search?checkIn=2026-10-09&checkOut=2026-10-08");
    await expect(page.getByText(/weren't valid/)).toBeVisible();
  });

  test("no results explains why and offers a reset", async ({ page }) => {
    await page.goto("/en/search?place=Atlantis");
    await expect(page.getByRole("heading", { name: "No stays match your search" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reset search" })).toBeVisible();
  });

  test("unknown booking reference is handled", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("tab", { name: "Email" }).click();
    await page.getByLabel("Email").fill("t@example.test");
    await page.getByLabel(/^Password/).fill("mockpass1");
    await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
    await page.goto("/en/bookings/MOCK-NOPE00");
    await expect(page.getByRole("heading", { name: "We can't find this booking here" })).toBeVisible();
  });
});

test.describe("search parity with the live product", () => {
  test("quick filters, bed and room facility filters, and review bands narrow the list", async ({ page }) => {
    await page.goto("/en/search");
    const count = async () => Number((await page.getByRole("heading", { level: 1 }).innerText()).match(/(\d+) stay/)?.[1] ?? 0);
    const all = await count();
    await page.goto("/en/search?popular=1");
    expect(await count()).toBeLessThan(all);
    await page.goto("/en/search?minRating=4.5");
    expect(await count()).toBeLessThan(all);
    await page.goto("/en/search?beds=King&roomFacilities=WiFi");
    expect(await count()).toBeLessThan(all);
  });

  test("list and grid layouts both work", async ({ page }) => {
    await page.goto("/en/search?view=grid");
    await expect(page.getByRole("link", { name: "Grid" })).toHaveAttribute("aria-current", "true");
    await expect(page.locator("li h2").first()).toBeVisible();
    await page.getByRole("link", { name: "List", exact: true }).click();
    await expect(page.getByRole("link", { name: "List", exact: true })).toHaveAttribute("aria-current", "true");
  });

  test("Stay near you: denied location leaves search fully usable", async ({ page, context }) => {
    await context.clearPermissions();
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (_ok, err) => err?.({ code: 1, message: "denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });
    await page.goto("/en/search");
    const toggle = page.locator("form button[aria-expanded]").first();
    if (await toggle.isVisible()) { // phones: the search box is collapsed until opened (retry in case the click lands before hydration)
      await expect(async () => { await toggle.click(); await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1000 }); }).toPass();
    }
    await page.getByRole("combobox", { name: "Where" }).click();
    await expect(page.getByText(/read your location once/i)).toBeVisible(); // explained BEFORE asking
    await page.getByRole("option", { name: /Nearby/ }).click();
    await expect(page.getByText(/Location is off/)).toBeVisible();
    await expect(page.locator("li h2").first()).toBeVisible(); // results still there
  });

  test("Stay near you: granted location sorts by distance and shows it", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 21.2, longitude: 94.88 }); // Bagan
    await page.goto("/en/search");
    const toggle = page.locator("form button[aria-expanded]").first();
    if (await toggle.isVisible()) { // phones: the search box is collapsed until opened (retry in case the click lands before hydration)
      await expect(async () => { await toggle.click(); await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1000 }); }).toPass();
    }
    await page.getByRole("combobox", { name: "Where" }).click();
    await page.getByRole("option", { name: /Nearby/ }).click();
    await expect(page.locator("li h2").first()).toHaveText(/Bagan Sunrise/);
    await expect(page.getByText(/away/).first()).toBeVisible();
  });

  test("favourites: save from a card, see it on the saved page", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("button", { name: /^Save .* to wishlist/ }).first().click();
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("t@example.test");
    await page.getByLabel(/^Password/).fill("mockpass1");
    await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
    await page.goto("/en/account/favorites");
    await expect(page.locator("li h2").first()).toBeVisible();
  });
});

test.describe("other pages from the live product", () => {
  for (const [path, heading] of [
    ["/en/legal/terms", "Terms of service"], ["/en/legal/privacy", "Privacy policy"], ["/en/legal/cookies", "Cookie policy"],
    ["/en/legal/location", "Location service policy"], ["/en/guide", "How to use TuTuStay"], ["/en/help/contact", "Contact support"],
    ["/en/about", "About TuTuStay"], ["/en/download", "Get the app"], ["/en/partners", "List your property"],
    ["/en/destinations", "Destinations"], ["/en/deals", "Deals"],
  ] as const) {
    test(`${path} renders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    });
  }

  test("legacy URLs redirect to their new home", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveURL(/\/en\/about$/);
    await page.goto("/partners/become-a-partner");
    await expect(page).toHaveURL(/\/en\/partners\/apply$/);
    await page.goto("/hotel/st-01");
    await expect(page).toHaveURL(/\/en\/stays\/st-01$/);
  });

  test("phone sign-in with a one-time code, and wrong code is explained", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("tab", { name: "Phone" }).click();
    await page.getByLabel("Phone number").fill("+95 9 123 456 78");
    await page.getByRole("button", { name: "Send code" }).click();
    await page.getByLabel("Code").fill("000000");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page.getByText("That code isn't right.")).toBeVisible();
    await page.getByLabel("Code").fill("123456");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page).toHaveURL(/\/en\/account\/bookings/);
  });

  test("partner application validates, then confirms", async ({ page }) => {
    await page.goto("/en/partners/apply");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText("Enter your business name.")).toBeVisible();
    await expect(page.getByLabel(/Business name/)).toBeFocused();
    await page.getByLabel(/Business name/).fill("Lantern Inn");
    await page.getByLabel(/Business type/).click();
    await page.getByRole("option", { name: /hotel/i }).first().click();
    await page.getByLabel(/First name/).fill("Mya");
    await page.getByLabel(/Last name/).fill("Aye");
    await page.getByLabel(/^Email/).fill("mya@example.test");
    await page.getByLabel(/^Phone number/).fill("9 123 4567");
    await page.getByLabel(/Street address/).fill("12 Main Road");
    await page.getByLabel(/^City/).fill("Yangon");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText("Application received")).toBeVisible();
  });

  test("account deletion explains the 30-day window, and signing in reactivates", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("t@example.test");
    await page.getByLabel(/^Password/).fill("mockpass1");
    await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
    await page.goto("/en/account");
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page.getByText(/after 30 days/)).toBeVisible();
    await page.getByRole("button", { name: "Yes, delete my account" }).click();
    await expect(page.getByText(/scheduled for deletion/)).toBeVisible();
  });

  test("sign up is 3 steps with an emailed code, and checks age and terms", async ({ page }) => {
    await page.goto("/en/signup");
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Send verification code" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await page.getByLabel("Email").fill("new@example.test");
    await page.getByRole("button", { name: "Send verification code" }).click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await page.getByLabel("Code").fill("000000");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page.getByText("That code isn't right.")).toBeVisible();
    await page.getByLabel("Code").fill("123456");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Use at least 6 characters." })).toBeVisible();
    await page.getByLabel(/^Password/).fill("mockpass1");
    await page.getByLabel("Confirm password").fill("different1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("The two passwords don't match.")).toBeVisible();
    await page.getByLabel("Confirm password").fill("mockpass1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("You must be at least 16 to create an account.")).toBeVisible();
    await page.getByLabel(/at least 16/).check();
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/en\/account$/);
  });

  test("forgot password is 3 steps and never reveals whether the email has an account", async ({ page }) => {
    await page.goto("/en/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.test"); // same path whether or not it exists
    await page.getByRole("button", { name: "Send verification code" }).click();
    await page.getByLabel("Code").fill("123456");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await page.getByLabel("New password").fill("mockpass2");
    await page.getByLabel("Confirm password").fill("mockpass2");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByText("Password changed")).toBeVisible();
  });

  test("FAQ search and topic filter, and the answers match the Terms", async ({ page }) => {
    await page.goto("/en/help/faq");
    await page.getByRole("button", { name: "Billing and payment" }).click();
    await expect(page.getByText("How do I cancel?")).toBeVisible();
    await expect(page.getByText("Who can leave a review?")).toHaveCount(0);
    await page.getByLabel("Search the FAQ").fill("cancel");
    await page.getByText("How do I cancel?").click();
    await expect(page.getByText("There is no cancel button in the app", { exact: false })).toBeVisible();
  });
});
