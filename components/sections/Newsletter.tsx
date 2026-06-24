import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import type { SimpleSection } from "@/lib/sanity/types";

/**
 * Section 7 — Join the list. Heading + body from Sanity above the live
 * newsletter form (Brevo double opt-in + Turnstile, in NewsletterForm).
 */
export function Newsletter({ data }: { data: SimpleSection | undefined }) {
  if (!data) return null;

  return (
    <Section id="newsletter" aria-label={data.title ?? "Join the list"}>
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

          <NewsletterForm />
        </div>
      </Container>
    </Section>
  );
}
