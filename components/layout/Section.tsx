import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionProps {
  children: ReactNode;
  /** Anchor target for in-page navigation (e.g. "practice"). */
  id?: string;
  /** Accessible label when the section has no visible heading. */
  "aria-label"?: string;
  className?: string;
}

/**
 * Semantic <section> carrying the vertical rhythm from DESIGN.md:
 * 4rem of "breath" on mobile, 8rem on desktop, between thematic blocks.
 */
export function Section({
  children,
  id,
  className,
  "aria-label": ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("py-section-mobile md:py-section", className)}
    >
      {children}
    </section>
  );
}
