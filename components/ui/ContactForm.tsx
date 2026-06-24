"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { HONEYPOT_FIELD } from "@/lib/validation";
import { publicEnv } from "@/lib/env";

type Status = "idle" | "submitting" | "success" | "error";

// Clearly bordered, filled field (DESIGN.md's 10%-bottom-border was too faint
// to see, especially in dark mode). Visible outline in both themes + teal focus.
const fieldClass =
  "min-h-11 w-full rounded-md border border-outline bg-surface-container-lowest px-3 py-2.5 font-sans text-body-md text-on-surface placeholder:text-outline focus:border-luminous-teal focus:outline-none focus:ring-2 focus:ring-luminous-teal/40 disabled:opacity-60";

/**
 * Contact form (Brevo transactional email). Posts to /api/contact, which emails
 * the site's contact inbox with the visitor as reply-to. Turnstile-gated and
 * honeypot-protected.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  const turnstileEnabled = Boolean(publicEnv.turnstileSiteKey);

  function update(field: keyof typeof form) {
    return (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    if (turnstileEnabled && !token) {
      setStatus("error");
      setMessage("Please complete the verification below.");
      return;
    }

    const honeypot = new FormData(event.currentTarget).get(HONEYPOT_FIELD);
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstileToken: token,
          [HONEYPOT_FIELD]: honeypot ?? "",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Thank you — your message is on its way. Ricki will be in touch.");
        setForm({ name: "", email: "", message: "" });
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
      setToken("");
      setResetSignal((n) => n + 1);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
      setToken("");
      setResetSignal((n) => n + 1);
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="max-w-md font-sans text-body-md text-on-surface"
      >
        {message}
      </p>
    );
  }

  return (
    <form
      aria-label="Contact form"
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-5 text-left"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="font-sans text-label-md uppercase text-secondary">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          value={form.name}
          onChange={update("name")}
          disabled={status === "submitting"}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="font-sans text-label-md uppercase text-secondary">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          disabled={status === "submitting"}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="font-sans text-label-md uppercase text-secondary">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={5000}
          rows={5}
          value={form.message}
          onChange={update("message")}
          disabled={status === "submitting"}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* Honeypot — visually hidden. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {turnstileEnabled ? (
        <Turnstile
          onVerify={setToken}
          onExpire={() => setToken("")}
          onError={() => setToken("")}
          resetSignal={resetSignal}
        />
      ) : null}

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
        {status === "error" && message ? (
          <p role="alert" className="font-sans text-body-md text-error">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
