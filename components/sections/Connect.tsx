import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/ui/ContactForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SimpleSection, SocialLink } from "@/lib/sanity/types";

/**
 * Section 8 — Connect. The contact form (Zod + Turnstile + Brevo transactional)
 * with a direct-email fallback and social links. Home anchor for "#connect",
 * used by several CTAs and the nav.
 */
export function Connect({
  data,
  social,
  contactEmail,
}: {
  data: SimpleSection | undefined;
  social: SocialLink[] | undefined;
  contactEmail: string | undefined;
}) {
  if (!data) return null;

  return (
    <Section id="connect" tone="alt" aria-label={data.title ?? "Connect"}>
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          {data.title ? (
            <h2 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
              {data.title}
            </h2>
          ) : null}
          {data.body ? (
            <p className="max-w-xl font-sans text-body-lg text-on-surface-variant text-pretty">
              {data.body}
            </p>
          ) : null}

          <ContactForm />

          <div className="mt-2 flex flex-col items-center gap-4">
            {contactEmail ? (
              <p className="font-sans text-body-md text-on-surface-variant">
                Prefer email?{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-secondary underline underline-offset-4 hover:text-luminous-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {contactEmail}
                </a>
              </p>
            ) : null}

            <SocialLinks
              links={social}
              className="justify-center"
              linkClassName="text-on-surface-variant hover:bg-surface-container hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
