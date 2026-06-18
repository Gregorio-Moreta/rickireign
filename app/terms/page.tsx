import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Prose } from "@/components/ui/Prose";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";
import { FALLBACK_CONTACT_EMAIL } from "@/lib/constants";

const LAST_UPDATED = "June 18, 2026";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that govern your use of rickireign.com.",
};

export default async function TermsPage() {
  const settings = await sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY);
  const contactEmail = settings?.contactEmail || FALLBACK_CONTACT_EMAIL;

  return (
    <Section aria-label="Terms of Use" className="pt-16 md:pt-24">
      <Container className="flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
            Terms of Use
          </h1>
          <p className="font-sans text-body-md text-outline">
            Last updated {LAST_UPDATED}
          </p>
        </header>

        <Prose>
          <p>
            These Terms of Use govern your access to and use of rickireign.com
            (the &ldquo;Site&rdquo;). By using the Site, you agree to these terms.
          </p>

          <h2>Use of the Site</h2>
          <p>
            The Site is provided for general informational purposes. You agree to
            use it lawfully and not to interfere with its operation, attempt to
            gain unauthorized access, or submit content that is unlawful or
            abusive through our forms.
          </p>

          <h2>Intellectual property</h2>
          <p>
            All content on the Site — text, images, logos, and design — is owned
            by Ricki Reign or used with permission, and is protected by
            applicable intellectual-property laws. You may not reproduce or
            redistribute it without permission.
          </p>

          <h2>No professional advice</h2>
          <p>
            Content on the Site is for general information only and is not a
            substitute for professional, medical, legal, or financial advice. Any
            services are provided under separate agreements made directly with
            Ricki Reign or the relevant business.
          </p>

          <h2>External links &amp; third-party services</h2>
          <p>
            The Site links to other websites (including the separate businesses
            Ricki founded and leads) and uses third-party services for
            scheduling, email, and analytics. We are not responsible for the
            content or practices of websites we do not control.
          </p>

          <h2>Disclaimer &amp; limitation of liability</h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; without warranties of any
            kind. To the fullest extent permitted by law, we are not liable for
            any damages arising from your use of the Site.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            Site after changes means you accept the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
