import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

/**
 * Automated accessibility sweep (axe-core) over the key pages, in both light
 * and dark themes. Asserts no WCAG 2.0/2.1 A/AA violations. The shared fixture
 * pre-seeds the consent cookie so the modal scrim doesn't cover the page.
 */
const PAGES = ["/", "/somatics", "/journal", "/privacy", "/terms"];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const path of PAGES) {
  for (const theme of ["light", "dark"] as const) {
    test(`a11y: ${path} (${theme})`, async ({ page }) => {
      if (theme === "dark") {
        await page.addInitScript(() =>
          localStorage.setItem("rr-theme", "dark"),
        );
      }
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      // Map to id + sample target for a readable failure message.
      const summary = violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        sample: v.nodes[0]?.target?.join(" "),
      }));
      expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
    });
  }
}
