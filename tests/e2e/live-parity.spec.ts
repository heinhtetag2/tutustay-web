import { expect, test } from "./base";

/** Things confirmed on dev.tutustay.com (docs/05 §3) that must stay present. */
test.describe("live-site parity", () => {
  test("header nav has a Stays menu with the four property types, plus Deals and Help & support (desktop)", async ({ page, isMobile }) => {
    test.skip(isMobile, "the nav collapses into the menu on small screens");
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Deals", "Help & support"]) await expect(nav.getByRole("link", { name })).toBeVisible();
    await nav.getByRole("button", { name: "Stays" }).click();
    for (const name of ["Hotel", "Motel / Guest house", "Resort", "Campsite", "Browse all stays"]) await expect(nav.getByRole("link", { name })).toBeVisible();
    await nav.getByRole("link", { name: "Resort" }).click();
    await expect(page).toHaveURL(/category=resort/);
  });

  test("the same links are in the mobile menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu" }).click();
    for (const name of ["Hotel", "Campsite", "Deals", "Help & support"]) await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name })).toBeVisible();
  });

  test("language dropdown offers English, Burmese and Korean with the active one checked", async ({ page, isMobile }) => {
    await page.goto("/en");
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.locator("summary:visible", { hasText: "EN" }).click();
    await expect(page.getByRole("link", { name: /မြန်မာ/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /한국어/ })).toBeVisible();
    await page.getByRole("link", { name: /မြန်မာ/ }).click();
    await expect(page).toHaveURL(/\/my/);
    await expect(page.locator("html")).toHaveAttribute("lang", "my");
  });

  test("footer has every link group the live footer has", async ({ page }) => {
    await page.goto("/en");
    const f = page.getByRole("contentinfo");
    for (const name of ["Destinations", "Deals & coupons", "Get the app", "About TuTuStay", "Help centre", "FAQ", "User guide", "Contact us", "1:1 Q&A", "My bookings", "Wishlist", "My reviews", "Account", "List your property", "Become a partner", "Terms of service", "Privacy policy", "Cookie policy", "Location policy"])
      await expect(f.getByRole("link", { name }), name).toBeVisible();
  });

  test("home: destination cards show a from-price, and the Explore tiles exist", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText(/from Ks [\d,]+\/night/).first()).toBeVisible();
    for (const name of ["Claim a coupon", "Your coupons", "Get the app", "Lowest price first", "Browse stays"]) await expect(page.getByRole("link", { name: new RegExp(`^${name}`) }).first()).toBeVisible();
  });

  test("search: price sliders narrow the list", async ({ page, isMobile }) => {
    await page.goto("/en/search");
    const count = async () => Number((await page.getByRole("heading", { level: 1 }).innerText()).match(/(\d+) stay/)?.[1] ?? 0);
    const all = await count();
    await page.goto("/en/search?maxPrice=40000");
    expect(await count()).toBeLessThan(all);
    if (isMobile) await page.getByRole("button", { name: /^Filters/ }).click(); // collapsed on small screens
    await expect(page.getByRole("slider", { name: "Maximum price" }).first()).toBeVisible();
  });

  test("stay: Share and Save sit in the title row, and the photo tour is grouped", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.goto("/en/stays/st-01");
    await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Show all photos" }).click();
    await expect(page.getByRole("heading", { name: "Photo tour" })).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Exterior" })).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Standard Double" })).toBeVisible();
  });

  test("deals has the live four tabs and a 'how to use coupons' link", async ({ page }) => {
    await page.goto("/en/deals");
    for (const name of ["All deals", "My coupons", "Claimed", "Expired"]) await expect(page.getByRole("tab", { name })).toBeVisible();
    await expect(page.getByRole("link", { name: "How to use coupons?" })).toHaveAttribute("href", /\/help\/faq#coupon/);
  });

  test("help: popular questions deep-link to an opened answer", async ({ page }) => {
    await page.goto("/en/help");
    await expect(page.getByRole("heading", { name: "Popular questions" })).toBeVisible();
    await page.getByRole("link", { name: "Is there a platform fee?" }).click();
    await expect(page).toHaveURL(/\/help\/faq#fee$/);
    await expect(page.locator("details#fee")).toHaveAttribute("open", "");
  });

  test("FAQ covers the live topics and keeps a 'still need help' block", async ({ page }) => {
    await page.goto("/en/help/faq");
    for (const q of ["Where can I see my bookings?", "How do I book a stay?", "How can I contact the hotel?", "Can I pay the remaining balance at the hotel?", "How will I receive a refund?"]) await expect(page.getByText(q)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Still need help?" })).toBeVisible();
  });

  test("login: show-password toggle, sign-up and reset links keep the return path", async ({ page }) => {
    await page.goto("/en/login?next=%2Fen%2Fstays%2Fst-01%2Fbook");
    const pw = page.getByLabel(/^Password/);
    await expect(pw).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: /Show password/ }).click();
    await expect(pw).toHaveAttribute("type", "text");
    await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", /\/en\/signup\?next=/);
    await expect(page.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute("href", /\/en\/forgot-password\?next=/);
  });

  test("My enquiries lives at the live URL", async ({ page }) => {
    await page.goto("/en/account/support/inquiries");
    await expect(page.getByRole("heading", { level: 1, name: "My enquiries" })).toBeVisible();
  });
});

test("home: Nearby is the first suggestion in Where and lands on search sorted by distance", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 21.2, longitude: 94.88 });
  await page.goto("/en");
  await page.getByRole("combobox", { name: "Where" }).click();
  await page.getByRole("option", { name: /Nearby/ }).click();
  await expect(page).toHaveURL(/\/en\/search\?.*near=/);
  await expect(page.locator("li h2").first()).toHaveText(/Bagan Sunrise/);
});

test.describe("price filter", () => {
  test("one slider with two thumbs, and Min/Max boxes that always show real values and stay in sync", async ({ page, isMobile }) => {
    await page.goto("/en/search");
    if (isMobile) await page.getByRole("button", { name: /^Filters/ }).click();
    const panel = page.getByRole("complementary", { name: "Filters" });
    await expect(panel.getByRole("slider")).toHaveCount(2); // one track, two thumbs
    const min = panel.getByRole("textbox", { name: "Min", exact: true });
    const max = panel.getByRole("textbox", { name: "Max", exact: true });
    await expect(min).toHaveValue("0"); // never an empty, unexplained box
    await expect(max).toHaveValue("300,000+");
    // typing a maximum moves the slider and filters the list
    await max.fill("50000");
    await max.press("Enter");
    await expect(page).toHaveURL(/maxPrice=50000/);
    await expect(panel.getByRole("slider", { name: "Maximum price" })).toHaveValue("50000");
    await expect(panel.getByText("Ks 0 – 50,000").filter({ visible: true })).toBeVisible();
    // clearing the maximum means "no maximum" again
    await max.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace"); // type like a person: fill("") fights the focus handler in a controlled input
    await page.keyboard.press("Enter");
    await expect(page).not.toHaveURL(/maxPrice=/);
    await expect(max).toHaveValue("300,000+");
  });

  test("the thumbs are keyboard operable", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await page.goto("/en/search");
    const thumb = page.getByRole("slider", { name: "Maximum price" }).first();
    await thumb.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveValue("290000");
    await expect(page).toHaveURL(/maxPrice=290000/);
  });
});
