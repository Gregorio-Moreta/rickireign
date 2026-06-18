"use client";

import { Button } from "@/components/ui/Button";
import { BookingButton } from "@/components/ui/BookingButton";
import type { CtaStyle } from "@/lib/sanity/types";

/**
 * Content-driven CTA renderer. A "Book a Discovery Call" CTA opens the Calendly
 * popup; every other CTA is a normal link to its target.
 *
 * Booking CTAs are detected by label (no Sanity schema/content change — the live
 * site shares one dataset, so the CTAs must stay valid anchors there too). If a
 * label is reworded away from "…discovery call", the CTA simply falls back to a
 * normal link to its target — no breakage, just no popup.
 */
function isBookingCta(label: string): boolean {
  return /discovery call/i.test(label);
}

export function CtaButton({
  label,
  target,
  style,
  className,
}: {
  label: string;
  target: string;
  style?: CtaStyle;
  className?: string;
}) {
  if (isBookingCta(label)) {
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

  return (
    <Button href={target} variant={style ?? "primary"} className={className}>
      {label}
    </Button>
  );
}
