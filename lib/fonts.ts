import { Libre_Caslon_Text, Hanken_Grotesk } from "next/font/google";

/**
 * Brand typefaces (DESIGN.md §Typography), self-hosted by next/font.
 * - Libre Caslon Text — display + headings ("Wisdom / History").
 * - Hanken Grotesk    — body + UI labels ("Modern / clarity").
 *
 * Each is exposed under a DISTINCT CSS variable (--font-caslon / --font-hanken)
 * which the Tailwind v4 `@theme` block in app/globals.css maps onto the
 * --font-display / --font-sans theme tokens. Using distinct names avoids a
 * self-referential `--font-sans: var(--font-sans)` cycle and preserves the
 * generic fallback chain. The classes are attached to <html> in the root layout.
 */

export const caslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-caslon",
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});
