import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with clsx and dedupe conflicting Tailwind utilities.
 * Use everywhere we compose conditional or variant-driven classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
