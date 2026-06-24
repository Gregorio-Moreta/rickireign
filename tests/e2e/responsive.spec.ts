import { test, expect } from "./fixtures";

/**
 * Responsive sanity at the four target breakpoints. The site is a single-scroll
 * layout, so the key invariants are: the header renders, the page h1 renders,
 * and nothing overflows horizontally (a common cause of mobile jank).
 */
const BREAKPOINTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

const PAGES = ["/", "/somatics", "/journal"];

for (const bp of BREAKPOINTS) {
  test.describe(`${bp.name} (${bp.width}px)`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    for (const path of PAGES) {
      test(`${path} renders without horizontal overflow`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("header").first()).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

        // No horizontal scrollbar: scrollWidth must not exceed the viewport
        // (allow 1px for sub-pixel rounding).
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  });
}
