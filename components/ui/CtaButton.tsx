"use client";

import { Button } from "@/components/ui/Button";
import { BookingButton } from "@/components/ui/BookingButton";
import { scrollToSection } from "@/lib/scroll";
import type { CtaStyle } from "@/lib/sanity/types";

/**
 * Content-driven CTA renderer. A booking CTA opens the Calendly popup; every
 * other CTA is a normal link to its target.
 *
 * Which one it is comes from the explicit `booking` flag in Sanity, so the label
 * is free to be reworded without breaking the popup. Callers that don't pass the
 * flag fall back to the original label match, which keeps any CTA still worded
 * "…discovery call" behaving exactly as before.
 */
function isBookingCta(label: string): boolean {
  return /discovery call/i.test(label);
}

export function CtaButton({
  label,
  target,
  style,
  className,
  booking,
}: {
  label: string;
  target: string;
  style?: CtaStyle;
  className?: string;
  booking?: boolean;
}) {
  if (booking ?? isBookingCta(label)) {
    return (
      <BookingButton
        variant={style ?? "primary"}
        className={className}
        fallbackHref={target}
      >
        {label}
      </BookingButton>
    );
  }

  // In-page section target (e.g. "#connect") → smooth-scroll, keep the URL clean.
  if (target.startsWith("#")) {
    return (
      <Button
        variant={style ?? "primary"}
        className={className}
        onClick={() => scrollToSection(target.slice(1))}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button href={target} variant={style ?? "primary"} className={className}>
      {label}
    </Button>
  );
}
