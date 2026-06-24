"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { HONEYPOT_FIELD } from "@/lib/validation";
import { publicEnv } from "@/lib/env";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Newsletter sign-up form (Brevo double opt-in). Posts to /api/newsletter,
 * which sends a confirmation email; success here means "check your inbox", not
 * "subscribed". Turnstile-gated and honeypot-protected.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  const turnstileEnabled = Boolean(publicEnv.turnstileSiteKey);

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
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: token,
          [HONEYPOT_FIELD]: honeypot ?? "",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage(
          "Almost there — check your inbox and confirm to finish subscribing.",
        );
        setEmail("");
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
      aria-label="Newsletter sign-up"
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="min-h-11 flex-1 rounded-md border border-outline bg-surface-container-lowest px-3 py-2.5 font-sans text-body-md text-on-surface placeholder:text-outline focus:border-luminous-teal focus:outline-none focus:ring-2 focus:ring-luminous-teal/40 disabled:opacity-60"
        />

        {/* Honeypot — visually hidden; bots fill it, humans never see it. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="nl-company">Company</label>
          <input
            id="nl-company"
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <Button type="submit" variant="primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>

      {turnstileEnabled ? (
        <Turnstile
          onVerify={setToken}
          onExpire={() => setToken("")}
          onError={() => setToken("")}
          resetSignal={resetSignal}
        />
      ) : null}

      {status === "error" && message ? (
        <p role="alert" className="font-sans text-body-md text-error">
          {message}
        </p>
      ) : null}
    </form>
  );
}
