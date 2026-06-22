/**
 * Smooth-scroll to a section of the single-scroll home page and keep the URL
 * clean (no #hash left in the address bar). Used by the header/footer section
 * links and in-page CTAs.
 *
 * - Offsets for the sticky header so the target isn't hidden underneath it.
 * - Respects `prefers-reduced-motion` (jumps instead of animating).
 * - `id === ""` scrolls to the top of the page.
 */
const NAV_OFFSET = 80; // sticky header height + a little breathing room

export function scrollToSection(id: string): void {
  if (typeof window === "undefined") return;

  const reduce =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  const el = id ? document.getElementById(id) : null;
  const top = el
    ? el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    : 0;
  window.scrollTo({ top: Math.max(top, 0), behavior });

  // Strip any #hash the browser added, without a reload.
  if (window.location.hash) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
}
