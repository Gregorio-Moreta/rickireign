import { test, expect } from "./fixtures";

/**
 * The booking CTA opens the Calendly scheduling popup. Booking lives only on
 * /somatics (the home page deliberately has no booking CTA), so we exercise it
 * there. The CTA is wired by the `booking` flag in Sanity rather than its label,
 * so this asserts on the current label ("Schedule a Conversation") only to find
 * the button. We stub the Calendly widget assets (no external network) and
 * assert the booking flow fires with the right scheduling URL.
 */
test("booking CTA opens Calendly with the scheduling URL", async ({
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

  await page.goto("/somatics");

  const cta = page.getByRole("link", { name: /schedule a conversation/i }).first();
  await expect(cta).toBeVisible();
  await cta.click();

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __calendlyUrl?: string }).__calendlyUrl))
    .toMatch(/calendly\.com\/.*discovery-call/);
});
