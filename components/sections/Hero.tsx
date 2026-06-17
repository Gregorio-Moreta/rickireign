import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SanityImage } from "@/components/ui/SanityImage";
import type { Hero as HeroData } from "@/lib/sanity/types";

/**
 * Section 1 — Hero. Headline + subheading + CTAs on the left; a portrait (when
 * present) and the "Current Focus" card on the right. Renders cleanly with no
 * portrait, since none are seeded yet.
 */
export function Hero({ data }: { data: HeroData | undefined }) {
  if (!data) return null;

  const { heading, subheading, ctas, portrait, currentFocus } = data;

  return (
    <Section aria-label="Introduction" className="pt-12 md:pt-20">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-gutter">
          {/* Copy + CTAs */}
          <div className="flex flex-col gap-stack lg:col-span-7">
            {heading ? (
              <h1 className="max-w-2xl font-display text-display-lg-mobile text-on-surface md:text-display-lg text-balance">
                {heading}
              </h1>
            ) : null}

            {subheading ? (
              <p className="max-w-xl font-sans text-body-lg text-on-surface-variant text-pretty">
                {subheading}
              </p>
            ) : null}

            {ctas && ctas.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {ctas.map((cta) => (
                  <Button
                    key={cta._key}
                    href={cta.href}
                    variant={cta.style ?? "primary"}
                  >
                    {cta.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Portrait + Current Focus */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <SanityImage
              image={portrait}
              fallbackSrc="/ricki-reign.jpg"
              alt="Ricki Reign"
              width={600}
              height={600}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-square w-full rounded-xl object-cover shadow-ambient"
            />
            <CurrentFocusCard focus={currentFocus} />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function CurrentFocusCard({
  focus,
}: {
  focus: HeroData["currentFocus"];
}) {
  const items = focus?.items?.filter(Boolean) ?? [];
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary-container/10 bg-surface-container-lowest p-6 shadow-ambient">
      <p className="font-sans text-label-md uppercase text-secondary">
        {focus?.label ?? "Current Focus"}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 font-sans text-body-md text-on-surface-variant"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-luminous-teal"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
