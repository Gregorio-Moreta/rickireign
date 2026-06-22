"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/scroll";

/**
 * Link to a section of the single-scroll home page.
 *
 * - On the home page: smooth-scrolls in place and keeps the URL clean (no hash).
 * - From any other route: navigates to `/#id`; <HashScroll> on the home page
 *   then scrolls to the section and strips the hash on arrival.
 * - `sectionId === ""` targets the top of the home page.
 *
 * The real `href` is preserved so the link works without JS, supports
 * middle-click / cmd-click "open in new tab", and is crawlable.
 */
export function SectionLink({
  sectionId,
  children,
  className,
  onNavigate,
}: {
  sectionId: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = sectionId ? `/#${sectionId}` : "/";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    // Not on the home page → let the browser navigate to `/#id`.
    if (pathname !== "/") return;
    // Preserve modifier-clicks (new tab/window).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToSection(sectionId);
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
