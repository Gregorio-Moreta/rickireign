import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import type { Practice, PracticeItem } from "@/lib/sanity/types";

/**
 * Section 3 — The Practice. Ricki's own somatic + leadership work, bookable
 * directly with her. Heading + intro, a grid of offering cards, and a primary
 * "Book a Discovery Call" CTA. Section title comes from Sanity (the name is a
 * placeholder pending Ricki — never hard-coded).
 */
export function PracticeSection({ data }: { data: Practice | undefined }) {
  if (!data) return null;

  const items = (data.items ?? []).filter((i) => i.title);

  return (
    <Section id="practice" aria-label={data.title ?? "The practice"}>
      <Container className="flex flex-col gap-stack">
        <header className="flex max-w-2xl flex-col gap-4">
          {data.title ? (
            <h2 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
              {data.title}
            </h2>
          ) : null}
          {data.intro ? (
            <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
              {data.intro}
            </p>
          ) : null}
        </header>

        {items.length > 0 ? (
          <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <OfferingCard key={item._key} item={item} index={i + 1} />
            ))}
          </ul>
        ) : null}

        {data.ctaLabel && data.ctaTarget ? (
          <div className="mt-2">
            <Button href={data.ctaTarget} variant="primary">
              {data.ctaLabel}
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

function OfferingCard({ item, index }: { item: PracticeItem; index: number }) {
  return (
    <li className="flex h-full flex-col gap-4 rounded-lg border border-primary-container/10 bg-surface-container-lowest p-7">
      <span
        aria-hidden="true"
        className="font-sans text-label-md uppercase text-secondary"
      >
        {String(index).padStart(2, "0")}
      </span>
      <h3 className="font-display text-headline-md text-on-surface">
        {item.title}
      </h3>
      {item.description ? (
        <p className="font-sans text-body-md text-on-surface-variant">
          {item.description}
        </p>
      ) : null}
    </li>
  );
}
