import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Lightweight prose wrapper for long-form copy (legal pages). Styles child
 * elements via descendant selectors so page bodies stay plain semantic HTML.
 * Brand tokens only (no typography plugin).
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 font-sans text-body-md text-on-surface-variant",
        "[&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-headline-md [&_h2]:text-on-surface",
        "[&_p]:text-pretty",
        "[&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-luminous-teal",
        "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6",
        "[&_strong]:text-on-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
