import { Container } from "@/components/layout/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { cn } from "@/lib/cn";
import type { SocialLink } from "@/lib/sanity/types";

/**
 * Site footer. Wordmark, social links, and footer text come from Sanity
 * `siteSettings`; the Contact/Privacy/Terms links are routes (Privacy/Terms
 * land in Phase 3).
 */

const FOOTER_LINKS = [
  { label: "Contact", href: "#connect" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const linkClasses = cn(
  "font-sans text-label-md uppercase text-inverse-on-surface/80",
  "transition-colors duration-200 hover:text-inverse-on-surface",
  "rounded-sm focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2",
  "focus-visible:ring-offset-inverse-surface",
);

interface FooterProps {
  wordmark?: string;
  social?: SocialLink[];
  footerText?: string;
}

export function Footer({ wordmark, social, footerText }: FooterProps) {
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
            {wordmark ?? "Ricki Reign"}
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

          <SocialLinks
            links={social}
            linkClassName="text-inverse-on-surface/80 hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface"
          />
        </div>

        <p className="mt-8 font-sans text-body-md text-inverse-on-surface/70">
          {footerText ?? `© ${year} Ricki Reign. All rights reserved.`}
        </p>
      </Container>
    </footer>
  );
}
