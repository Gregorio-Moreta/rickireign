import { test, expect } from "./fixtures";

/**
 * The Sentry capture probes must stay fail-closed.
 *
 * `SENTRY_CHECK_TOKEN` is unset in every normal environment (local, CI, and
 * production between verification runs), and in that state both probe paths
 * must be indistinguishable from routes that do not exist. This spec is the
 * guard on that: it's the thing that catches someone shipping the probes with
 * the gate wired the wrong way round, or leaving a token behind in the code.
 *
 * It deliberately does NOT test the authorized path — that throws by design and
 * sends a real event to the production Sentry project.
 */
test.describe("Sentry check probes are fail-closed", () => {
  test("POST /api/sentry-check 404s without a token", async ({ request }) => {
    const response = await request.post("/api/sentry-check?label=e2e");
    expect(response.status()).toBe(404);
  });

  test("POST /api/sentry-check 404s with a wrong token", async ({ request }) => {
    const response = await request.post("/api/sentry-check?label=e2e", {
      headers: { "x-sentry-check-token": "not-the-token" },
    });
    expect(response.status()).toBe(404);
  });

  test("the worker probe path 404s without a token", async ({ request }) => {
    // On the `next start` target this is simply an unknown route; on the
    // Cloudflare preview it exercises the real fail-closed branch in
    // cloudflare/worker.ts. Both must 404.
    const response = await request.post("/api/sentry-check/worker?label=e2e");
    expect(response.status()).toBe(404);
  });

  test("GET is not a way around the gate", async ({ request }) => {
    const response = await request.get("/api/sentry-check");
    expect([404, 405]).toContain(response.status());
  });
});

/**
 * The Sentry tunnel. A bare GET matches no rewrite rule and must fall through
 * to a 404 — on Cloudflare that is only true because of the guard in
 * cloudflare/worker.ts, since OpenNext's `has` matcher has no presence check on
 * query params and would otherwise 500. Real SDK traffic always carries
 * `?o=…&p=…`, so this asserts the malformed case only.
 */
test("bare GET /monitoring 404s rather than erroring", async ({ request }) => {
  const response = await request.get("/monitoring");
  expect(response.status()).toBe(404);
});
