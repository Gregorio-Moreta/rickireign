import { NextResponse } from "next/server";
import { contactSchema, isHoneypotFilled } from "@/lib/validation";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendContactEmail } from "@/lib/brevo";
import { clientIp } from "@/lib/http";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";
import { FALLBACK_CONTACT_EMAIL } from "@/lib/constants";

/**
 * POST /api/contact — contact form (Brevo transactional email).
 *
 * Flow: parse JSON → honeypot → Zod → Turnstile verify → send a transactional
 * email to the site's contact inbox, with the visitor as replyTo.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (isHoneypotFilled(payload)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete all fields." },
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

  const settings = await sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY);
  const to = settings?.contactEmail || FALLBACK_CONTACT_EMAIL;

  try {
    const result = await sendContactEmail({
      fromName: parsed.data.name,
      fromEmail: parsed.data.email,
      message: parsed.data.message,
      to,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Something went wrong. Please try again later." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
