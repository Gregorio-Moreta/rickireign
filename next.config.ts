import path from "node:path";
import type { NextConfig } from "next";

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

export default nextConfig;

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
