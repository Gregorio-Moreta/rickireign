import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Content-Security-Policy. Active third parties:
 *   Google Analytics (via @next/third-parties)
 *   Sanity image CDN (img-src cdn.sanity.io — Phase 2)
 *   Cloudflare Turnstile (Phase 3 — forms): script + iframe challenge from
 *     challenges.cloudflare.com; siteverify is server-to-server (not CSP-gated).
 *   Calendly (Phase 3 — booking popup): widget script from assets.calendly.com,
 *     scheduling iframe from calendly.com (apex) + *.calendly.com. The apex is
 *     required separately — `*.calendly.com` does NOT match the bare apex, and
 *     the popup frames `https://calendly.com/<user>/<event>`.
 * next/font self-hosts fonts, so fonts are effectively 'self'; the Google Fonts
 * origins are listed per the plan and are harmless. Form POSTs go to same-origin
 * /api/* so `form-action 'self'` stays.
 *
 * Still deferred (kept here as a reference — NOT active until their phase):
 *   Sanity API:           connect-src https://*.api.sanity.io https://*.apicdn.sanity.io
 *
 * On `script-src 'unsafe-inline'`: we deliberately keep it (rather than a nonce).
 * A nonce-based CSP needs a fresh per-request nonce, but this site is mostly
 * statically generated / ISR-cached (60s) and the App Router embeds inline
 * hydration scripts (self.__next_f.push) plus our pre-paint theme script into
 * that cached HTML. A per-request nonce would mismatch the cached document and
 * BREAK every script. Hash-based CSP is likewise impractical (Next's inline
 * bootstrap varies per build/route). So inline scripts stay allowed; the rest
 * of the policy is tightly scoped (default 'self', no object-src, base-uri/
 * form-action 'self', frame-ancestors 'none', upgrade-insecure-requests).
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://challenges.cloudflare.com https://assets.calendly.com",
  "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://region1.google-analytics.com https://challenges.cloudflare.com",
  "img-src 'self' data: https://cdn.sanity.io https://*.google-analytics.com https://*.googletagmanager.com https://*.calendly.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src 'self' https://challenges.cloudflare.com https://calendly.com https://*.calendly.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Upgrade any stray http subresource to https (everything is already https).
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  // Force HTTPS for two years, including subdomains. The site is HTTPS-only on
  // both Vercel and Cloudflare, so this is safe; omit `preload` to keep it
  // reversible (preload-list submission is hard to undo).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Isolate our browsing context (mitigates cross-origin leak/Spectre-class
  // attacks). `same-origin` is safe here: the only window we open is the
  // Calendly fallback tab, which we open with noopener anyway, and it does not
  // affect the Turnstile/Calendly iframes (governed by frame-src).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't infer a stray
  // lockfile elsewhere on the machine.
  turbopack: {
    root: path.join(__dirname),
  },
  // Allow next/image to optimize Sanity-hosted assets. CSP `img-src` already
  // permits cdn.sanity.io; this lets the optimizer fetch + resize from it.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // The blog route is now /journal (matches the "Journal" nav label). Permanently
  // redirect the old /blog paths so any saved/shared links still resolve.
  async redirects() {
    return [
      { source: "/blog", destination: "/journal", permanent: true },
      { source: "/blog/:path*", destination: "/journal/:path*", permanent: true },
    ];
  },
};

/**
 * Wrap with Sentry. Dormant until env is set:
 *   - org/project/authToken come from env (build-time secret for source maps);
 *     with no authToken, source-map upload is simply skipped.
 *   - tunnelRoute proxies events through our own domain (/monitoring), so we
 *     don't add Sentry hosts to the CSP connect-src and ad-blockers don't drop
 *     events. The consent/headers config must keep /monitoring un-gated.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});

// Wire Cloudflare bindings into the local `next dev` server ONLY.
// Guard on NODE_ENV so this never runs during `next build`: the adapter's own
// guard checks only for AsyncLocalStorage (not dev mode), so on a production
// build it would spin up the wrangler/miniflare proxy and crash the build with
// `unhandledRejection: write EPIPE` (seen on Vercel). The dynamic import also
// keeps the proxy code out of production bundles entirely.
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch((error) => {
      console.warn("initOpenNextCloudflareForDev (dev) failed:", error);
    });
}
