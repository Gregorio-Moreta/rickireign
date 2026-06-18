/**
 * Cloudflare Turnstile server-side verification.
 *
 * `TURNSTILE_SECRET_KEY` is a server-only secret — read directly from
 * `process.env` here, never via `lib/env.ts` (which is client-safe / public).
 * Fails closed: any missing secret, network error, or non-success response is
 * treated as "not a human".
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set — rejecting submission.");
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as SiteverifyResponse;
    if (!data.success) {
      console.warn("Turnstile rejected:", data["error-codes"]);
    }
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return false;
  }
}
