import { z } from "zod";

/**
 * Server-side input contracts for the public forms. Both route handlers parse
 * untrusted JSON through these before doing any work — never trust the client.
 */

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

// Cloudflare Turnstile client token; verified server-side against siteverify.
const turnstileToken = z.string().min(1, "Verification required.").max(4096);

export const newsletterSchema = z.object({
  email,
  turnstileToken,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  // Reject CR/LF in the name: it lands in the email subject line, where a
  // newline would be a header-injection vector (Zod .trim() leaves interior
  // line breaks intact).
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100)
    .regex(/^[^\r\n]*$/, "Name cannot contain line breaks."),
  email,
  message: z.string().trim().min(1, "Message is required.").max(5000),
  turnstileToken,
});
export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Honeypot field shared by client + server. It is visually hidden, so humans
 * never fill it; a non-empty value means a bot. Kept out of the Zod schemas so
 * the server can silently fake success rather than returning a 400 that signals
 * the trap.
 */
export const HONEYPOT_FIELD = "company";

export function isHoneypotFilled(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;
  const value = (payload as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}
