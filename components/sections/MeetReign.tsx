import { PortableText, type PortableTextComponents } from "next-sanity";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { cn } from "@/lib/cn";
import type { About } from "@/lib/sanity/types";

/**
 * Section 5 — Meet Reign. Origin story (Portable Text, optional), portrait
 * (optional — none seeded yet), and a Caslon-italic pull-quote. Degrades to the
 * label/title/quote when the rich-text body is empty.
 */

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
        {children}
      </p>
    ),
  },
};

export function MeetReign({ data }: { data: About | undefined }) {
  if (!data) return null;

  const { label, title, body, portrait, quote } = data;
  const hasBody = Array.isArray(body) && body.length > 0;
  const showPortrait = hasImageAsset(portrait);

  return (
    <Section id="about" aria-label={title ?? label ?? "Meet Reign"}>
      <Container>
        <div
          className={cn(
            "grid items-start gap-12",
            showPortrait && "lg:grid-cols-12 lg:gap-gutter",
          )}
        >
          {showPortrait ? (
            <div className="lg:col-span-5">
              <SanityImage
                image={portrait}
                alt="Ricki Reign"
                width={680}
                height={820}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="w-full rounded-xl object-cover shadow-ambient"
              />
            </div>
          ) : null}

          <div
            className={cn(
              "flex flex-col gap-6",
              showPortrait ? "lg:col-span-7" : "max-w-3xl",
            )}
          >
            {label ? (
              <p className="font-sans text-label-md uppercase text-secondary">
                {label}
              </p>
            ) : null}
            {title ? (
              <h2 className="max-w-2xl font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
                {title}
              </h2>
            ) : null}

            {hasBody ? (
              <div className="flex max-w-2xl flex-col gap-4">
                <PortableText value={body} components={bodyComponents} />
              </div>
            ) : null}

            {quote ? (
              <blockquote className="mt-4 border-l-2 border-luminous-teal pl-6 font-display italic text-quote text-on-surface md:text-headline-md text-balance">
                {quote}
              </blockquote>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
