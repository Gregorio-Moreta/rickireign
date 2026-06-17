import { createClient } from "next-sanity";
import { publicEnv } from "@/lib/env";

const projectId = publicEnv.sanityProjectId;
const dataset = publicEnv.sanityDataset;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET — set them in .env.local and in the Vercel/Cloudflare build env.",
  );
}

/**
 * Read-only client for PUBLISHED content, served from Sanity's CDN.
 * The `production` dataset is public, so no token is needed (secure-defaults:
 * the public site never carries a write/editor token). `perspective: "published"`
 * makes intent explicit rather than relying on the absence of a token.
 * Drafts/preview will use a separate server-only token in a later phase.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-01",
  useCdn: true,
  perspective: "published",
});
