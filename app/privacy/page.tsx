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
          <p className="font-sans text-body-md text-outline">
            Last updated {LAST_UPDATED}
          </p>
        </header>

        <Prose>
          <p>
            This Privacy Policy explains what information rickireign.com (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects, how we use it, and the choices you have. This is a
            marketing website — we do not sell products, take payments, or create
            user accounts.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Newsletter sign-ups.</strong> If you join our list, we
              collect your email address to send you updates. We use a
              double opt-in: you will receive a confirmation email and are only
              added once you confirm.
            </li>
            <li>
              <strong>Contact form.</strong> If you send a message, we collect
              your name, email address, and the contents of your message so we
              can reply.
            </li>
            <li>
              <strong>Analytics.</strong> If you accept analytics cookies, we
              collect anonymous usage data (such as pages viewed and general
              location) to understand how the site is used.
            </li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>To send the newsletter you subscribed to.</li>
            <li>To respond to messages you send us.</li>
            <li>To measure and improve the website (only with your consent).</li>
          </ul>

          <h2>Third-party services</h2>
          <p>We rely on a small number of trusted providers:</p>
          <ul>
            <li>
              <strong>Brevo</strong> — email delivery for the newsletter and
              contact form. See{" "}
              <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer">
                Brevo&rsquo;s privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Cloudflare Turnstile</strong> — protects our forms from
              spam and abuse without tracking you across sites.
            </li>
            <li>
              <strong>Google Analytics</strong> — website analytics, loaded only
              after you accept cookies. See{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google&rsquo;s privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Calendly</strong> — scheduling, opened only if you choose
              to book a call. See{" "}
              <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">
                Calendly&rsquo;s privacy policy
              </a>
              .
            </li>
          </ul>

          <h2>Cookies &amp; consent</h2>
          <p>
            Analytics cookies are off by default. We show a banner asking for
            your choice; Google Analytics only loads if you accept. We store your
            choice in a single cookie so we do not ask again. You can change your
            mind by clearing the <strong>rr-consent</strong> cookie in your
            browser.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep newsletter subscriptions until you unsubscribe (every email
            includes an unsubscribe link). We keep contact messages only as long
            as needed to respond and maintain our records.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal information, and you can unsubscribe at any time. To make a
            request, email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
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
