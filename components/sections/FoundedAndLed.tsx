import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SanityImage } from "@/components/ui/SanityImage";
import type { Business, FoundedAndLed as FoundedAndLedData } from "@/lib/sanity/types";

/**
 * Section 4 — Founded & Led. The separate businesses Ricki founded and runs,
 * each linking out to its own site (booking happens there, not here). Framed
 * around her as founder. Section title comes from Sanity (placeholder pending
 * Ricki). External links open in a new tab with hardened rel.
 */
export function FoundedAndLed({ data }: { data: FoundedAndLedData | undefined }) {
  if (!data) return null;

  const businesses = (data.businesses ?? []).filter((b) => b.name);

  return (
    <Section id="founded" aria-label={data.title ?? "Founded and led"}>
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

        {businesses.length > 0 ? (
          <ul className="grid gap-gutter md:grid-cols-2">
            {businesses.map((business) => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

function BusinessCard({ business }: { business: Business }) {
  const { name, tagline, description, image, externalUrl } = business;

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-primary-container/10 bg-surface-container-lowest">
      <SanityImage
        image={image}
        alt={name ?? ""}
        width={760}
        height={420}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[16/9] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-7">
        <h3 className="font-display text-headline-md text-on-surface">{name}</h3>
        {tagline ? (
          <p className="font-display italic text-body-lg text-on-surface-variant">
            {tagline}
          </p>
        ) : null}
        {description ? (
          <p className="font-sans text-body-md text-on-surface-variant">
            {description}
          </p>
        ) : null}
        {externalUrl ? (
          <div className="mt-auto pt-2">
            <Button
              href={externalUrl}
              target="_blank"
              variant="tertiary"
              aria-label={
                name ? `Visit ${name} (opens in a new tab)` : undefined
              }
            >
              Visit site
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
