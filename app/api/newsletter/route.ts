import { NextResponse } from "next/server";
import { newsletterSchema, isHoneypotFilled } from "@/lib/validation";
import { verifyTurnstile } from "@/lib/turnstile";
import { createDoiContact } from "@/lib/brevo";
import { clientIp, publicOrigin } from "@/lib/http";

/**
 * POST /api/newsletter — newsletter sign-up (Brevo double opt-in).
 *
 * Flow: parse JSON → honeypot → Zod → Turnstile verify → Brevo DOI (sends the
 * confirmation email; only confirmed addresses are stored). Always returns a
 * GENERIC success — never reveals whether the email already exists.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot tripped → silently pretend success, do nothing.
  if (isHoneypotFilled(payload)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, clientIp(request));
  if (!human) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  const origin = publicOrigin(request);
  try {
    const result = await createDoiContact(parsed.data.email, `${origin}/?subscribed=1`);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Something went wrong. Please try again later." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Newsletter route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
