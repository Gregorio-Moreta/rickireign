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
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
}
