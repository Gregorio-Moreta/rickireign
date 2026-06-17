import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SimpleSection, SocialLink } from "@/lib/sanity/types";

/**
 * Section 8 — Connect. Real social links and a direct-email CTA work now; the
 * full contact form (Zod + Turnstile + Brevo transactional) is Phase 3. This is
 * the home anchor for "#connect" used by several CTAs and the nav.
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
    <Section id="connect" aria-label={data.title ?? "Connect"}>
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

          {contactEmail ? (
            <Button href={`mailto:${contactEmail}`} variant="primary">
              Email Ricki
            </Button>
          ) : null}

          <SocialLinks
            links={social}
            className="mt-2 justify-center"
            linkClassName="text-on-surface-variant hover:bg-surface-container hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          />
        </div>
      </Container>
    </Section>
  );
}
