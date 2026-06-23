/**
 * Format an ISO datetime (Sanity `publishedAt`) as a human date, e.g.
 * "June 23, 2026". Returns null for missing/invalid input so callers can omit
 * the date gracefully. UTC-based to stay stable across server/client + ISR.
 */
export function formatDate(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
