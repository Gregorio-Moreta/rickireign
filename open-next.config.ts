import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext configuration for deploying this Next.js app to Cloudflare Workers.
 * Defaults are sufficient for Phase 0 (no incremental/ISR cache backend wired
 * yet). When Sanity ISR/revalidation lands, configure an R2/KV cache here and
 * the matching binding in wrangler.jsonc.
 */
export default defineCloudflareConfig();
