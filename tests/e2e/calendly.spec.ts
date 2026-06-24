import { test, expect } from "./fixtures";

/**
 * The "Book a Discovery Call" CTA opens the Calendly scheduling popup. We stub
 * the Calendly widget assets (no external network) and assert the booking flow
 * fires with the right scheduling URL — i.e. the out-link resolves correctly.
 */
test("Discovery Call CTA opens Calendly with the scheduling URL", async ({
  page,
}) => {
  // Stub the lazily-loaded Calendly assets so we never touch the network.
  await page.route(/assets\.calendly\.com\/.*widget\.css/, (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  await page.route(/assets\.calendly\.com\/.*widget\.js/, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.Calendly = { initPopupWidget: function (o) { window.__calendlyUrl = o.url; } };`,
    }),
  );

  await page.goto("/");

  const cta = page.getByRole("button", { name: /discovery call/i }).first();
  await expect(cta).toBeVisible();
  await cta.click();

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __calendlyUrl?: string }).__calendlyUrl))
    .toMatch(/calendly\.com\/.*discovery-call/);
});
