import { NextResponse } from "next/server";
import { clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import {
  SentryCheckError,
  isSentryCheckAuthorized,
  sanitizeLabel,
} from "@/lib/sentry-check";

// Node runtime: the point of this probe is to exercise the Next.js server SDK
// (@sentry/nextjs via sentry.server.config.ts + instrumentation.ts's
// onRequestError), which is the Vercel server path. On Cloudflare the very same
// request instead exercises the OpenNext error path — see the note below.
export const runtime = "nodejs";
// A probe must never be cached or prerendered.
export const dynamic = "force-dynamic";

// Generous enough for a verification run, tight enough that the route can't be
// used to generate error volume if the token ever leaked.
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/** Bare 404 — byte-identical to a route that does not exist. */
function notFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "X-Robots-Tag": "noindex, nofollow" },
  });
}

/**
 * POST /api/sentry-check — deliberately throws, to prove Sentry captures it.
 *
 * Gated on the server-only `SENTRY_CHECK_TOKEN` (sent as `x-sentry-check-token`;
 * a header, not a query param, so it stays out of access logs and Referer).
 * With the token unset this is a 404 and nothing below ever runs.
 *
 * This one route proves two different things depending on the target:
 *   • Vercel   — the throw reaches @sentry/nextjs's onRequestError hook.
 *   • Cloudflare — it does NOT throw out to the Worker: OpenNext catches every
 *     Next-level error (requestHandler.js: `error("NextJS request failed.", e)`
 *     then renders a 500) and never rethrows, so @sentry/cloudflare's withSentry
 *     sees a plain 500 Response and captures nothing. That gap is closed by
 *     `captureConsoleIntegration` in cloudflare/worker.ts — this probe is how we
 *     verify it, and it is the reason CF server monitoring was near-zero.
 */
export async function POST(request: Request) {
  if (
    !isSentryCheckAuthorized(
      request.headers.get("x-sentry-check-token"),
      process.env.SENTRY_CHECK_TOKEN,
    )
  ) {
    return notFound();
  }

  const ip = clientIp(request);
  const limited = rateLimit(`sentry-check:${ip ?? "unknown"}`, LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const label = sanitizeLabel(new URL(request.url).searchParams.get("label"));
  throw new SentryCheckError("nextjs-route-handler", label);
}
