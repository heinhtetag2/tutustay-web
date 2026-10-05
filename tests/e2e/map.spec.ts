import { expect, test } from "./base";

test.describe("map (full-screen, like the Booking.com pattern)", () => {
  test("Show on map opens a full-screen map with price pins and the list beside it", async ({ page, isMobile }) => {
    await page.goto("/en/search");
    await page.getByRole("link", { name: "Show on map" }).click();
    await expect(page).toHaveURL(/view=map/);
    await expect(page.getByRole("region", { name: "Full-screen map and results" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Close map/ })).toBeVisible();
    // The site chrome is out of the way and inert, so Tab and screen readers stay inside the map view.
    expect(await page.locator("body > [inert]").count()).toBeGreaterThan(0);
    // The overlay covers the whole viewport.
    await page.getByRole("region", { name: "Full-screen map and results" }).evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished))); // measure after the entrance animation, not during it
    const box = await page.getByRole("region", { name: "Full-screen map and results" }).boundingBox();
    const vp = page.viewportSize()!;
    expect(box!.width).toBeGreaterThanOrEqual(vp.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1);
    if (isMobile) await expect(page.getByRole("button", { name: "Map", pressed: true })).toBeVisible();
    // Nearby stays are clustered, so every stay is reachable either as a price pin or inside a "N stays" pin.
    await expect(page.getByRole("button", { name: /(, Ks [\d,]+$)|(\d+ stays, zoom in)/ }).first()).toBeVisible();
  });

  test("selecting a pin highlights its card and opens a popup with a link to the stay", async ({ page, isMobile }) => {
    await page.goto("/en/search?view=map");
    await page.getByRole("button", { name: /Bagan Sunrise Hotel, Ks 85,000/ }).click();
    await expect(page.getByRole("link", { name: "View stay" })).toBeVisible();
    if (isMobile) await page.getByRole("button", { name: "List", exact: true }).click();
    await expect(page.locator("#stay-st-05 a").first()).toHaveClass(/ring-2/);
    if (isMobile) await page.getByRole("button", { name: "Map", exact: true }).click();
    await page.getByRole("link", { name: "View stay" }).click();
    await expect(page).toHaveURL(/\/en\/stays\/st-05/);
  });

  test("hovering a card highlights its pin", async ({ page, isMobile }) => {
    test.skip(isMobile, "no hover on touch");
    await page.goto("/en/search?view=map");
    await page.locator("#stay-st-05").hover();
    await expect(page.getByRole("button", { name: /Bagan Sunrise Hotel, Ks/ })).toHaveClass(/bg-action-primary/);
  });

  test("opening eases in and closing eases out before leaving", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("link", { name: "Show on map" }).click();
    const region = page.getByRole("region", { name: "Full-screen map and results" });
    await expect(region).toHaveClass(/anim-map-in/);
    await page.getByRole("link", { name: /Close map/ }).click();
    await expect(region).toHaveClass(/anim-map-out/); // the exit animation plays first
    await expect(page).not.toHaveURL(/view=map/);
  });

  test("with reduced motion the map opens and closes without waiting", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/search?view=map");
    await expect(page.getByRole("button", { name: /Ks [\d,]+$|\d+ stays/ }).first()).toBeVisible();
    const region = page.getByRole("region", { name: "Full-screen map and results" });
    await page.getByRole("link", { name: /Close map/ }).click();
    await expect(region).not.toHaveClass(/anim-map-out/); // no exit animation to wait for
    await expect(page).not.toHaveURL(/view=map/);
  });

  test("Escape and Close map return to the list, with the search kept", async ({ page }) => {
    await page.goto("/en/search?place=Yangon&view=map");
    await expect(page.getByRole("button", { name: /Ks [\d,]+$|\d+ stays/ }).first()).toBeVisible(); // wait until the page is hydrated
    await page.keyboard.press("Escape");
    await expect(page).not.toHaveURL(/view=map/);
    await expect(page).toHaveURL(/place=Yangon/);
    await page.getByRole("link", { name: "Show on map" }).click();
    await page.getByRole("link", { name: /Close map/ }).click();
    await expect(page).not.toHaveURL(/view=map/);
    await expect(page.locator("body > [inert]")).toHaveCount(0); // chrome is usable again
  });

  test("Update results when map moves: panning the map searches that area", async ({ page, isMobile }) => {
    test.skip(isMobile, "pan gesture is exercised on desktop");
    await page.goto("/en/search?view=map");
    await page.getByLabel("Update results when map moves").check();
    const map = page.getByRole("region", { name: /Map of \d+ stays/ });
    const b = (await map.boundingBox())!;
    await page.waitForTimeout(1200); // moves in the first moment after framing are ours, not the user's
    await page.mouse.move(b.x + 160, b.y + 140); // an empty patch of map, not a pin
    await page.mouse.down();
    await page.mouse.move(b.x + 560, b.y + 360, { steps: 14 });
    await page.mouse.up();
    await expect(page).toHaveURL(/bounds=/);
    await page.getByLabel("Update results when map moves").uncheck();
    await expect(page).not.toHaveURL(/bounds=/);
  });

  test("an empty map area explains itself", async ({ page, isMobile }) => {
    await page.goto("/en/search?view=map&bounds=-10,-10,-5,-5");
    if (isMobile) await page.getByRole("button", { name: "List", exact: true }).click(); // the list pane holds the message
    await expect(page.getByText("No stays in this part of the map.")).toBeVisible();
  });

  test("the stay page shows a real location map with OpenStreetMap attribution", async ({ page }) => {
    await page.goto("/en/stays/st-01");
    await expect(page.getByRole("region", { name: /Map showing where Shwe Pann Hotel/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "OpenStreetMap" }).first()).toBeVisible();
  });

  test("the map is keyboard reachable: a pin opens with Enter", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await page.goto("/en/search?view=map");
    await page.getByRole("button", { name: /Bagan Sunrise Hotel, Ks/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "View stay" })).toBeVisible();
  });
});

test("overlapping stays are clustered, and a cluster zooms in to separate them", async ({ page }) => {
  await page.goto("/en/search?view=map"); // all of Myanmar: the three Yangon stays sit on top of each other
  const cluster = page.getByRole("button", { name: /3 stays, zoom in to see them/ });
  await expect(cluster).toBeVisible();
  await cluster.click();
  await expect(page.getByRole("button", { name: /Shwe Pann Hotel, Ks 45,000/ })).toBeVisible();
});


test.describe("filters beside the map (wide screens)", () => {
  test("a 'Filter by:' column sits left of the list and filtering keeps you in the map", async ({ page, isMobile }) => {
    test.skip(isMobile, "the column needs a wide screen; smaller screens use the Filters button");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/search?view=map");
    const col = page.getByRole("complementary", { name: "Filters" });
    await expect(col.getByRole("heading", { name: "Filter by:" })).toBeVisible();
    await expect(col.getByText("Reservation available")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeHidden(); // no sheet button when the column is showing
    await col.getByLabel("Popular").click(); // controlled by the URL, so its state changes after navigation
    await expect(page).toHaveURL(/popular=1/);
    await expect(page).toHaveURL(/view=map/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("4 stays");
    await expect(page.getByRole("region", { name: "Full-screen map and results" })).toBeVisible();
  });

  test("on narrower screens the filters collapse into a Filters button", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/en/search?view=map");
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Filter by:" })).toBeHidden();
  });
});

test("Close map floats over the top right of the map on wide screens, like Booking.com", async ({ page, isMobile }) => {
  test.skip(isMobile, "small screens use the top bar");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/search?view=map");
  const region = page.getByRole("region", { name: "Full-screen map and results" });
  await region.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const close = page.getByRole("link", { name: /Close map/ });
  await expect(close).toBeVisible();
  const box = (await close.boundingBox())!;
  expect(box.x + box.width).toBeGreaterThan(1440 - 40); // hard against the right edge
  expect(box.y).toBeLessThan(60); // and the top
  await expect(page.getByLabel("Update results when map moves")).toBeVisible();
  const upd = (await page.getByLabel("Update results when map moves").boundingBox())!;
  expect(upd.x).toBeGreaterThan(500); // top-left of the MAP, not of the page
});

test("on small screens the slim top bar keeps Close map reachable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/en/search?view=map");
  await expect(page.getByRole("link", { name: /Close map/ })).toBeVisible();
});
