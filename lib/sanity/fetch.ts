import type { QueryParams } from "next-sanity";
import { client } from "./client";

/**
 * Time-based ISR window for published content. A signature-verified Sanity
 * revalidation webhook (publish-triggered) is deferred to a later phase; until
 * then content refreshes at most once per minute.
 */
export const REVALIDATE_SECONDS = 60;

/**
 * Typed read against the published CDN client. Callers pass the expected shape
 * (hand-written in `types.ts`, since typegen isn't wired up) as `T`.
 *
 * Returns `T | null`: our queries use `[0]` projections, which resolve to
 * `null` when the document is absent. Surfacing that in the type forces callers
 * to guard (`if (!home) ...` / optional chaining) rather than relying on it.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T | null> {
  return client.fetch<T | null>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
}
