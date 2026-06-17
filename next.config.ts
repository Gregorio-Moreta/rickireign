import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content-Security-Policy. Active third parties: Google Analytics (via
 * @next/third-parties) and the Sanity image CDN (img-src cdn.sanity.io —
 * Phase 2, also backing next/image's remotePatterns below). next/font
 * self-hosts fonts, so fonts are effectively 'self'; the Google Fonts origins
 * are listed per the plan and are harmless.
 *
 * Still deferred (kept here as a reference — NOT active until their phase):
 *   Sanity API:           connect-src https://*.api.sanity.io https://*.apicdn.sanity.io
 *   Cloudflare Turnstile: script-src / frame-src https://challenges.cloudflare.com  (Phase 3)
 *   Calendly:             frame-src https://*.calendly.com ; script-src https://assets.calendly.com  (Phase 3)
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://region1.google-analytics.com",
  "img-src 'self' data: https://cdn.sanity.io https://*.google-analytics.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
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
