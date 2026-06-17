"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

/**
 * Placeholder nav links. Real nav data comes from Sanity `siteSettings.nav`
 * in a later phase; these in-page anchors keep the foundation navigable.
 */
const NAV_LINKS = [
  { label: "The Practice", href: "#practice" },
  { label: "Founded & Led", href: "#founded" },
  { label: "About", href: "#about" },
  { label: "Connect", href: "#connect" },
] as const;

const linkClasses = cn(
  "font-sans text-label-md uppercase text-on-surface-variant",
  "transition-colors duration-200 hover:text-primary-container",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm",
);

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 layer-nav w-full",
        "border-b border-outline-variant/60",
        "bg-surface/80 backdrop-blur-[12px]",
      )}
    >
      <Container as="nav" className="flex items-center justify-between py-4">
        {/* Caslon wordmark */}
        <a
          href="#top"
          className={cn(
            "font-display text-xl tracking-tight text-on-surface",
            "rounded-sm focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary-container focus-visible:ring-offset-2",
            "focus-visible:ring-offset-surface",
          )}
        >
          Ricki Reign
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClasses}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded md:hidden",
            "cursor-pointer text-on-surface",
            "transition-colors duration-200 hover:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        hidden={!open}
        className={cn(
          "border-t border-outline-variant/60 md:hidden",
          "bg-surface/95 backdrop-blur-[12px]",
        )}
      >
        <Container className="py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(linkClasses, "block py-1")}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
