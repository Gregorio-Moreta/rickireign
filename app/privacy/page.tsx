import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Prose } from "@/components/ui/Prose";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";
import { FALLBACK_CONTACT_EMAIL } from "@/lib/constants";

const LAST_UPDATED = "June 21, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How rickireign.com collects, uses, and protects your information.",
};

export default async function PrivacyPage() {
  const settings = await sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY);
  const contactEmail = settings?.contactEmail || FALLBACK_CONTACT_EMAIL;

  return (
    <Section aria-label="Privacy Policy" className="pt-16 md:pt-24">
      <Container className="flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
            Privacy Policy
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Last updated {LAST_UPDATED}
          </p>
        </header>

        <Prose>
          <p>
            This Privacy Policy explains what information rickireign.com
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, how and why we use it,
            and the rights you have. The data controller is Ricki Reign; you can
            reach us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. This is a
            marketing website — we do not sell products, take payments, create
            user accounts, or sell or rent your personal information to anyone.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Newsletter sign-ups.</strong> Your email address. We use a
              double opt-in: you receive a confirmation email and are only added
              to the list once you confirm.
            </li>
            <li>
              <strong>Contact form.</strong> Your name, email address, and the
              contents of your message, so we can reply.
            </li>
            <li>
              <strong>Analytics (only with your consent).</strong> Aggregated
              usage data such as pages viewed, approximate region, device and
              browser type. We do not use it to identify you personally.
            </li>
            <li>
              <strong>Anti-spam.</strong> When you submit a form, Cloudflare
              Turnstile may process technical signals (and your IP address) to
              confirm you are human. We do not use it to track you across sites.
            </li>
          </ul>

          <h2>Why we use it &amp; our legal basis</h2>
          <p>
            For visitors in the EU/UK, we rely on these lawful bases under the
            GDPR:
          </p>
          <ul>
            <li>
              <strong>Newsletter</strong> — your <strong>consent</strong>, which
              you can withdraw at any time via the unsubscribe link in any email.
            </li>
            <li>
              <strong>Replying to your message</strong> — our{" "}
              <strong>legitimate interest</strong> (and your request) in
              responding to you.
            </li>
            <li>
              <strong>Analytics cookies</strong> — your <strong>consent</strong>,
              which you can give, refuse, or withdraw via the banner or the{" "}
              &ldquo;Cookie settings&rdquo; link in the footer.
            </li>
            <li>
              <strong>Security / anti-spam</strong> — our{" "}
              <strong>legitimate interest</strong> in protecting the site and our
              forms from abuse.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Analytics cookies are off until you accept. The cookies we use:
          </p>
          <ul>
            <li>
              <strong>rr-consent</strong> (essential) — remembers your cookie
              choice for about six months so we do not ask again. Set without
              consent because it is strictly necessary.
            </li>
            <li>
              <strong>Google Analytics</strong> (<code>_ga</code>,{" "}
              <code>_ga_*</code>) — set only after you accept, to measure usage.
            </li>
            <li>
              <strong>Cloudflare Turnstile</strong> — may set a short-lived
              cookie when you submit a form, to prevent spam.
            </li>
            <li>
              <strong>Calendly</strong> — may set cookies only inside the booking
              window, and only if you open it.
            </li>
          </ul>
          <p>
            You can change or withdraw consent any time via the{" "}
            &ldquo;Cookie settings&rdquo; link in the footer, or by clearing
            cookies in your browser.
          </p>

          <h2>Third-party processors</h2>
          <p>We share data only with trusted providers that process it for us:</p>
          <ul>
            <li>
              <strong>Brevo</strong> (EU-based) — newsletter and contact-form
              email delivery.{" "}
              <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Google Analytics</strong> — usage analytics (consent only).{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Cloudflare</strong> — hosting and Turnstile anti-spam.{" "}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Calendly</strong> — scheduling, only if you book a call.{" "}
              <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </a>
              .
            </li>
          </ul>

          <h2>International transfers</h2>
          <p>
            Some providers (Google, Cloudflare, Calendly) are based in the United
            States, so your information may be processed outside your country,
            including in the US. Where required, these transfers rely on
            appropriate safeguards such as the European Commission&rsquo;s
            Standard Contractual Clauses.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep newsletter subscriptions until you unsubscribe. We keep
            contact messages only as long as needed to handle your enquiry and
            our records, then delete them. Analytics data is retained per
            Google&rsquo;s default retention settings.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live (including under the GDPR and the
            California CCPA), you may have the right to:
          </p>
          <ul>
            <li>access the personal information we hold about you;</li>
            <li>correct it if it is inaccurate;</li>
            <li>delete it;</li>
            <li>restrict or object to how we use it;</li>
            <li>receive a copy in a portable format;</li>
            <li>withdraw consent at any time; and</li>
            <li>unsubscribe from emails at any time.</li>
          </ul>
          <p>
            To exercise any of these, email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We do not sell
            your personal information. If you are in the EU/UK and believe we have
            mishandled your data, you also have the right to lodge a complaint
            with your local data protection authority.
          </p>

          <h2>Children</h2>
          <p>
            This site is not directed to children under 16, and we do not
            knowingly collect their personal information. If you believe a child
            has provided us data, contact us and we will delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will revise the
            &ldquo;Last updated&rdquo; date above when we do.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
