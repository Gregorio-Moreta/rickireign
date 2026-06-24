import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Background tone, so adjacent sections separate (in both light and dark):
 * - `base`     — the page surface.
 * - `alt`      — a subtly deeper container tint.
 * - `contrast` — the grounding band (token-driven, stays dark in both themes).
 * All token-driven, so the alternation holds when the theme flips.
 */
export type SectionTone = "base" | "alt" | "contrast";

const toneClasses: Record<SectionTone, string> = {
  base: "",
  alt: "bg-surface-container-low",
  contrast: "bg-band text-on-band",
};

interface SectionProps {
  children: ReactNode;
  /** Anchor target for in-page navigation (e.g. "work"). */
  id?: string;
  /** Accessible label when the section has no visible heading. */
  "aria-label"?: string;
  /** Background tone for separation. Defaults to `base`. */
  tone?: SectionTone;
  className?: string;
}

/**
 * Semantic <section> carrying the vertical rhythm from DESIGN.md:
 * 4rem of "breath" on mobile, 8rem on desktop, between thematic blocks.
 */
export function Section({
  children,
  id,
  tone = "base",
  className,
  "aria-label": ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("py-section-mobile md:py-section", toneClasses[tone], className)}
    >
      {children}
    </section>
  );
}
