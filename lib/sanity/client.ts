import { createClient } from "next-sanity";

/**
 * Read-only client for PUBLISHED content, served from Sanity's CDN.
 * The `production` dataset is public, so no token is needed (secure-defaults:
 * the public site never carries a write/editor token). Drafts/preview will use
 * a separate server-only token in a later phase.
 */
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-06-01",
  useCdn: true,
});
