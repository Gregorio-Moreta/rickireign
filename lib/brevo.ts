/**
 * Brevo (formerly Sendinblue) API client — server-only.
 *
 * `BREVO_API_KEY` and the list / template / sender config are secrets read
 * directly from `process.env` (never `lib/env.ts`, never `NEXT_PUBLIC_*`).
 * Only used inside route handlers.
 */

const BREVO_BASE = "https://api.brevo.com/v3";

function brevoHeaders(): HeadersInit {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not set.");
  return {
    "api-key": apiKey,
    "content-type": "application/json",
    accept: "application/json",
  };
}

export interface BrevoResult {
  ok: boolean;
  status: number;
}

/**
 * Newsletter double opt-in. Sends the confirmation email via the `optin`-tagged
 * DOI template; the contact is only added to the list AFTER the recipient
 * clicks the confirmation link. `redirectionUrl` is where they land afterwards.
 *
 * A 400 ("contact already exists" / "already in list") is reported as ok so the
 * caller can keep its generic-success contract — we never reveal membership.
 */
export async function createDoiContact(
  email: string,
  redirectionUrl: string,
): Promise<BrevoResult> {
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  if (!Number.isInteger(listId) || !Number.isInteger(templateId)) {
    throw new Error("BREVO_LIST_ID / BREVO_DOI_TEMPLATE_ID not configured.");
  }

  const res = await fetch(`${BREVO_BASE}/contacts/doubleOptinConfirmation`, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify({
      email,
      includeListIds: [listId],
      templateId,
      redirectionUrl,
    }),
  });

  if (res.ok) return { ok: true, status: res.status };

  // Treat "already exists / already subscribed" as a benign success.
  const text = await res.text().catch(() => "");
  if (res.status === 400 && /already|exist/i.test(text)) {
    return { ok: true, status: res.status };
  }
  console.error("Brevo DOI error:", res.status, text.slice(0, 300));
  return { ok: false, status: res.status };
}

/**
 * Contact form → transactional email to the site's contact inbox. The sender
 * must be a verified Brevo sender (`BREVO_SENDER_EMAIL`); the visitor's address
 * goes in `replyTo` so Ricki can reply to them directly.
 */
export async function sendContactEmail(params: {
  fromName: string;
  fromEmail: string;
  message: string;
  to: string;
}): Promise<BrevoResult> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not set.");

  const { fromName, fromEmail, message, to } = params;
  const safeMessage = escapeHtml(message);

  const res = await fetch(`${BREVO_BASE}/smtp/email`, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify({
      sender: { email: senderEmail, name: "Ricki Reign — Website" },
      to: [{ email: to }],
      replyTo: { email: fromEmail, name: fromName },
      subject: `New message from ${fromName} via rickireign.com`,
      htmlContent: `<p><strong>From:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</p><p style="white-space:pre-wrap">${safeMessage}</p>`,
      textContent: `From: ${fromName} <${fromEmail}>\n\n${message}`,
    }),
  });

  if (res.ok) return { ok: true, status: res.status };
  const text = await res.text().catch(() => "");
  console.error("Brevo transactional error:", res.status, text.slice(0, 300));
  return { ok: false, status: res.status };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
