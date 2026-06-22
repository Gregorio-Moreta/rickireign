"use client";

import { useEffect } from "react";
import { scrollToSection } from "@/lib/scroll";

/**
 * Mounted on the home page. If the URL arrived with a #hash (e.g. a visitor
 * clicked a section link from /privacy, which navigates to `/#connect`), scroll
 * to that section and strip the hash so the address bar stays clean. Runs once.
 */
export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    // Defer to after first paint so the target section exists in the DOM.
    const raf = requestAnimationFrame(() => scrollToSection(id));
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
