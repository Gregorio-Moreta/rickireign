/**
 * Blog tags are free-text strings in Sanity. URLs need a stable, clean slug, so
 * we slugify for the route (`/journal/tag/<slug>`) and resolve back to the original
 * display string when querying — two different tags never collide in practice
 * for this small blog, and the resolve step picks the first match.
 */

/** "Somatic Leadership" → "somatic-leadership". */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a URL slug back to its display tag, given all known tags. */
export function resolveTagSlug(
  slug: string,
  tags: string[] | undefined | null,
): string | undefined {
  return tags?.find((tag) => slugifyTag(tag) === slug);
}
