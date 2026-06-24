import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/ui/CtaButton";
import type { WhoIsThisFor as WhoIsThisForData } from "@/lib/sanity/types";

/**
 * Section 6 — Who is this for? A four-point checklist on a dark earth-charcoal
 * band (DESIGN.md), closing with the discovery-call CTA. The CTA is restyled to
 * a light fill so it keeps strong contrast against the dark surface.
 */
export function WhoIsThisFor({ data }: { data: WhoIsThisForData | undefined }) {
  if (!data) return null;

  const points = (data.points ?? []).filter(Boolean);

  return (
    <Section aria-label={data.title ?? "Who is this for?"} tone="contrast">
      <Container className="flex flex-col gap-stack">
        {data.title ? (
          <h2 className="max-w-2xl font-display text-headline-lg-mobile text-on-band md:text-headline-lg text-balance">
            {data.title}
          </h2>
        ) : null}

        {points.length > 0 ? (
          <ul className="grid max-w-4xl gap-5 sm:grid-cols-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckIcon />
                <span className="font-sans text-body-lg text-on-band/90">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {data.ctaLabel && data.ctaTarget ? (
          <div className="mt-2">
            <CtaButton
              label={data.ctaLabel}
              target={data.ctaTarget}
              style="primary"
              className="bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim focus-visible:ring-primary-fixed focus-visible:ring-offset-earth-charcoal"
            />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-1 shrink-0 text-luminous-teal"
    >
      <path d="m5 12 5 5L20 6" />
    </svg>
  );
}
