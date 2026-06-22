"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  CONSENT_EVENT,
  CONSENT_REOPEN_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Cookie consent — a centered modal (global opt-in). GA never loads before
 * "Accept" (see lib/consent + Analytics). Shows on first visit until a choice is
 * made, and again whenever the footer "Cookie settings" link re-opens it so the
 * visitor can change or withdraw consent.
 *
 * Accessible: role="dialog" + aria-modal, labelled/described, focus moves to the
 * dialog on open, a soft scrim dims the page, and the entrance respects
 * prefers-reduced-motion (CSS, via the global reduced-motion rule). Renders
 * nothing on the server / first paint (consent lives in a client cookie) to
 * avoid a hydration mismatch.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    const reopen = () => setVisible(true);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
    };
  }, []);

  // When open: move focus into the dialog, trap Tab inside it, and lock
  // background scroll. All DOM side-effects (no React state) and cleaned up on
  // close so the page returns to normal.
  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const focusables = dialog!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  function choose(value: "granted" | "denied") {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="layer-banner animate-scrim-in fixed inset-0 flex items-center justify-center bg-earth-charcoal/50 p-4 backdrop-blur-[2px]">
      {/* Scrim dims the page; no click-to-dismiss since a choice is required. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        aria-describedby="consent-body"
        tabIndex={-1}
        className="animate-modal-in w-full max-w-md rounded-xl border border-primary-container/10 bg-surface-container-lowest p-6 shadow-ambient focus:outline-none sm:p-8"
      >
        <h2
          id="consent-title"
          className="font-display text-headline-md text-on-surface"
        >
          A note on cookies
        </h2>
        <p
          id="consent-body"
          className="mt-3 font-sans text-body-md text-on-surface-variant text-pretty"
        >
          We use cookies to understand how the site is used. Analytics stays off
          until you accept — you can change this anytime via &ldquo;Cookie
          settings&rdquo; in the footer. See our{" "}
          <Link
            href="/privacy"
            className="text-secondary underline underline-offset-4 hover:text-luminous-teal"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => choose("denied")}
            className="w-full px-6 py-2.5 sm:w-auto"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            onClick={() => choose("granted")}
            className="w-full px-6 py-2.5 sm:w-auto"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
