import { expect, test } from "./base";
import type { Page } from "@playwright/test";

/**
 * Every label, heading and option below was extracted from dev.tutustay.com (2026-10-05) and must exist on our matching page.
 * Deliberate wording differences are NOT listed here (they are in docs/05): "Night" is "Overnight", "Reserve" is "Choose room".
 * Desktop only: several of these live behind collapsed panels on small screens.
 */
async function pageText(page: Page) {
  return (
    (await page.locator("body").innerText()) + " " +
    (await page.locator("option").allTextContents()).join(" ") + " " +
    (await page.locator("[aria-label]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")).join(" "))) + " " +
    (await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href")).join(" ")))
  ).toLowerCase();
}

const CASES: { path: string; strings: string[] }[] = [
  { path: "/en", strings: ["Why Travellers Trust TuTuStay", "Top Destinations", "Explore TuTuStay", "More Stays to Explore", "Reviews from real stays", "Hotel", "Motel / Guest house", "Resort", "Campsite", "Deals", "Help & support", "Sign in", "Claim a coupon", "Your coupons", "Get the app", "Lowest price first", "Browse stays", "Check-in", "Check-out", "Search", "From", "/night",
    "Destinations", "Deals & coupons", "About TuTuStay", "Help centre", "FAQ", "User guide", "Contact us", "1:1 Q&A", "My bookings", "Wishlist", "My reviews", "Account", "List your property", "Become a partner", "Terms of service", "Privacy policy", "Cookie policy", "Location policy", "Save"] },
  { path: "/en/search?place=Yangon", strings: ["Filters", "Hotel", "Motel / Guest house", "Resort", "Campsite", "Popular", "Reservation available", "Coupons", "Price", "Minimum price", "Maximum price", "Room facilities", "AC", "Daily Housekeeping", "Electric kettle", "Fan", "Review score", "Fantastic", "Excellent", "Comfort", "Fair", "Property facilities", "24 Hour Front Desk", "Airport Shuttle", "Cafe", "Campfire Area", "Bed types", "Single", "Double", "Queen", "Sort by", "Recommended", "Show on map", "List", "Grid", "Save", "Check-in", "Check-out", "Guests"] },
  { path: "/en/stays/st-01", strings: ["Share", "Show all photos", "Check-in", "Check-out", "Adults", "Children", "Rooms", "foreign", "From", "About", "Facilities", "Policies", "Location", "Reviews", "Questions before you book", "Back", "Details", "Breakfast", "Check-in and check-out", "Airport Shuttle", "WiFi"] },
  { path: "/en/login", strings: ["Email", "Password", "Show password", "Continue with Google", "Continue with Telegram", "Forgot your password", "create an account", "/signup", "/forgot-password"] },
  { path: "/en/signup", strings: ["Sign up", "Step 1 of 3", "Email", "Send verification code", "verification code"] },
  { path: "/en/forgot-password", strings: ["Reset password", "Step 1 of 3", "Find your account", "Email", "Send verification code"] },
  { path: "/en/deals", strings: ["Deals", "All deals", "My coupons", "Claimed", "Expired", "How to use coupons?"] },
  { path: "/en/destinations", strings: ["Destinations", "Yangon", "stays"] },
  { path: "/en/help", strings: ["Help & support", "Frequently asked questions", "Contact support", "1:1 Q&A", "Deals", "Popular questions", "Is there a platform fee?", "Can I get a payment receipt?"] },
  { path: "/en/help/faq", strings: ["Search the FAQ", "All topics", "Billing and payment", "Accommodation and booking", "Still need help?", "1:1 Q&A", "My enquiries", "Contact support", "Can I get a payment receipt?", "Is there a platform fee?", "Where can I see my bookings?", "How do I book a stay?", "How can I contact the hotel?", "Can I pay the remaining balance at the hotel?", "How will I receive a refund?"] },
  { path: "/en/help/contact", strings: ["Contact support", "Changing or cancelling a stay", "Write an enquiry", "My enquiries"] },
  { path: "/en/guide", strings: ["How to use TuTuStay", "Search for a stay", "Explore on the map", "Choose a room", "Follow your booking", "For hotel managers"] },
  { path: "/en/about", strings: ["About TuTuStay", "How booking works", "Browse stays"] },
  { path: "/en/download", strings: ["Get the app", "Google Play"] },
  { path: "/en/partners", strings: ["List your property", "Your rooms, your rates", "Manage in one place", "How it works", "Become a partner"] },
  { path: "/en/partners/apply", strings: ["Your business", "Business name", "Business type", "Website or social page", "Optional", "Contact person", "First name", "Last name", "Email", "Phone", "Where you operate", "Street address", "Suite, unit or floor", "City", "State or region", "Country", "Myanmar", "Thailand", "Singapore", "Malaysia", "Vietnam", "Laos", "Cambodia", "China", "India", "Japan", "South Korea", "United States", "Postal code", "Documents", "Send application", "+95"] },
  { path: "/en/legal/terms", strings: ["Terms of service", "Version 1.0.1", "Legal"] },
  { path: "/en/legal/privacy", strings: ["Privacy policy", "Version 1.0.1"] },
  { path: "/en/legal/cookies", strings: ["Cookie policy", "Version 1.0.0"] },
  { path: "/en/legal/location", strings: ["Location service policy", "Version 1.0.1"] },
];

test.describe("strings extracted from the live site", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");
  for (const c of CASES) {
    test(`${c.path} contains the live labels`, async ({ page }) => {
      await page.goto(c.path);
      await page.waitForLoadState("networkidle");
      const text = await pageText(page);
      const missing = c.strings.filter((s) => !text.includes(s.toLowerCase()));
      expect(missing, `missing on ${c.path}`).toEqual([]);
    });
  }
});
