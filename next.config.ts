import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content-Security-Policy for Phase 0. Allows only the third parties wired up
 * now: Google Analytics (via @next/third-parties). next/font self-hosts fonts,
 * so fonts are effectively 'self'; the Google Fonts origins are listed per the
 * plan and are harmless.
 *
 * Later phases will need these origins (kept here as a reference — NOT active):
 *   Sanity image CDN:     img-src https://cdn.sanity.io
 *   Sanity API:           connect-src https://*.api.sanity.io https://*.apicdn.sanity.io
 *   Cloudflare Turnstile: script-src / frame-src https://challenges.cloudflare.com
 *   Calendly:             frame-src https://*.calendly.com ; script-src https://assets.calendly.com
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://region1.google-analytics.com",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
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

// Enable Cloudflare bindings (and OpenNext context) during local `next dev`.
// No-op for the Vercel/standard build; only wires up the Cloudflare dev shim.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
