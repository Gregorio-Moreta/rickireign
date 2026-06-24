"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionLink } from "@/components/layout/SectionLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/lib/sanity/types";

/** Strip a leading "#" from a Sanity nav anchor → bare section id. */
const toSectionId = (anchor: string) => anchor.replace(/^#/, "");

/**
 * Fallback nav used only when Sanity `siteSettings.nav` is empty, so the header
 * is never link-less. Real data is passed in from the server layout.
 */
const FALLBACK_LINKS = [
  { _key: "f1", label: "About", anchor: "#about" },
  { _key: "f2", label: "The Work", anchor: "#work" },
  { _key: "f3", label: "Connect", anchor: "#connect" },
];

interface NavProps {
  wordmark?: string;
  links?: SiteSettings["nav"];
}

const linkClasses = cn(
  "font-sans text-label-md uppercase text-on-surface-variant",
  "transition-colors duration-200 hover:text-primary-container",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm",
);

export function Nav({ wordmark, links }: NavProps) {
  const [open, setOpen] = useState(false);
  const navLinks = links && links.length > 0 ? links : FALLBACK_LINKS;

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
        <SectionLink
          sectionId=""
          className={cn(
            "font-display text-xl tracking-tight text-on-surface",
            "rounded-sm focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary-container focus-visible:ring-offset-2",
            "focus-visible:ring-offset-surface",
          )}
        >
          {wordmark ?? "Ricki Reign"}
        </SectionLink>

        {/* Right cluster: desktop links + theme toggle (always) + mobile menu */}
        <div className="flex items-center gap-1 md:gap-6">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link._key}>
                <SectionLink sectionId={toSectionId(link.anchor)} className={linkClasses}>
                  {link.label}
                </SectionLink>
              </li>
            ))}
            {/* Journal is a real route, not an in-page anchor. */}
            <li>
              <Link href="/journal" className={linkClasses}>
                Journal
              </Link>
            </li>
          </ul>

          <ThemeToggle />

          {/* Mobile menu toggle */}
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
        </div>
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
            {navLinks.map((link) => (
              <li key={link._key}>
                <SectionLink
                  sectionId={toSectionId(link.anchor)}
                  onNavigate={() => setOpen(false)}
                  className={cn(linkClasses, "block py-1")}
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
            <li>
              <Link
                href="/journal"
                onClick={() => setOpen(false)}
                className={cn(linkClasses, "block py-1")}
              >
                Journal
              </Link>
            </li>
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
