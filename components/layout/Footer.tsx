import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

/**
 * Site footer. Links are placeholders for Phase 0 — real routes and Sanity
 * `siteSettings.social` data arrive in later phases.
 */

const FOOTER_LINKS = [
  { label: "Contact", href: "#connect" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "YouTube", href: "#", icon: YouTubeIcon },
] as const;

const linkClasses = cn(
  "font-sans text-label-md uppercase text-inverse-on-surface/80",
  "transition-colors duration-200 hover:text-inverse-on-surface",
  "rounded-sm focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2",
  "focus-visible:ring-offset-inverse-surface",
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <a
            href="#top"
            className={cn(
              "font-display text-2xl text-inverse-on-surface",
              "rounded-sm focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2",
              "focus-visible:ring-offset-inverse-surface",
            )}
          >
            Ricki Reign
          </a>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={linkClasses}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full",
                    "text-inverse-on-surface/80 transition-colors duration-200",
                    "hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-inverse-surface",
                  )}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 font-sans text-body-md text-inverse-on-surface/70">
          &copy; {year} Ricki Reign. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

function InstagramIcon() {
  return (
    <IconWrap>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52.01-4.76.07-.9.04-1.39.2-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.32-.28.81-.32 1.71C3.21 8.48 3.2 8.85 3.2 12s0 3.52.06 4.76c.04.9.2 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.12.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52 0 4.76-.07c.9-.04 1.39-.2 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s0-3.52-.07-4.76c-.04-.9-.2-1.39-.32-1.71a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.12-.81-.28-1.71-.32C15.52 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 7.06 12 4.94 4.94 0 0 1 12 7.06Zm0 1.8A3.14 3.14 0 1 0 15.14 12 3.14 3.14 0 0 0 12 8.86Zm5.14-2.96a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z" />
    </IconWrap>
  );
}

function YouTubeIcon() {
  return (
    <IconWrap>
      <path d="M23.5 6.5a3 3 0 0 0-2.11-2.13C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.39.51A3 3 0 0 0 .5 6.5 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.5 3 3 0 0 0 2.11 2.13c1.89.51 9.39.51 9.39.51s7.5 0 9.39-.51A3 3 0 0 0 23.5 17.5 31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.2 3.6Z" />
    </IconWrap>
  );
}
