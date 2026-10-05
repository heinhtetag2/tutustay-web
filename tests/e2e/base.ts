import { test as base } from "@playwright/test";

// A 1x1 transparent PNG. Tests never request real OpenStreetMap tiles: automated bulk requests break their usage policy
// and make runs slow and flaky. The map, pins and clustering work the same without the picture underneath.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ contentType: "image/png", body: PNG }));
    await use(page);
  },
});
export { expect } from "@playwright/test";
