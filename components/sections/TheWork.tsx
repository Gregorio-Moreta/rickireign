import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { cn } from "@/lib/cn";
import type { Business, SomaticsCard, TheWork as TheWorkData } from "@/lib/sanity/types";

/**
 * Section 3 — The Work. The merged section that replaced "The Practice" +
 * "Founded & Led". One leadership identity expressed across three arenas:
 * Exhale Under Pressure and Community Birth Village (each links out to its own
 * site) and Somatics (links to the internal /somatics page). This section
 * EXPLAINS the work so a visitor understands each arena before clicking —
 * there is deliberately no booking CTA here (booking lives only on /somatics).
 */
export function TheWork({ data }: { data: TheWorkData | undefined }) {
  if (!data) return null;

  const businesses = (data.businesses ?? []).filter((b) => b.name);
  const somatics = data.somatics;
  const hasCards = businesses.length > 0 || Boolean(somatics?.name);

  return (
    <Section id="work" aria-label={data.title ?? "The work"}>
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

        {hasCards ? (
          <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business._id} business={business} />
            ))}
            {somatics?.name ? <SomaticsCardItem somatics={somatics} /> : null}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

/** Shared card chrome so the three arenas read as one uniform row. */
function ArenaCard({
  name,
  tagline,
  description,
  image,
  href,
  linkLabel,
  external,
}: {
  name: string;
  tagline?: string;
  description?: string;
  image?: Business["image"];
  href: string;
  linkLabel: string;
  external: boolean;
}) {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-primary-container/10 bg-surface-container-lowest">
      {hasImageAsset(image) ? (
        <SanityImage
          image={image}
          alt={name}
          width={760}
          height={428}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <ArenaCover name={name} />
      )}
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
        <div className="mt-auto pt-2">
          {external ? (
            <Button
              href={href}
              target="_blank"
              variant="tertiary"
              aria-label={`Visit ${name} (opens in a new tab)`}
            >
              {linkLabel}
            </Button>
          ) : (
            <Button href={href} variant="tertiary" aria-label={`${linkLabel}: ${name}`}>
              {linkLabel}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function BusinessCard({ business }: { business: Business }) {
  return (
    <ArenaCard
      name={business.name ?? ""}
      tagline={business.tagline}
      description={business.description}
      image={business.image}
      href={business.externalUrl ?? "#"}
      linkLabel="Visit site"
      external={Boolean(business.externalUrl)}
    />
  );
}

function SomaticsCardItem({ somatics }: { somatics: SomaticsCard }) {
  return (
    <ArenaCard
      name={somatics.name ?? "Somatics"}
      tagline={somatics.tagline}
      description={somatics.description}
      href="/somatics"
      linkLabel={somatics.linkLabel ?? "Learn more"}
      external={false}
    />
  );
}

/** On-brand gradient panel for an arena with no image, so the row stays even. */
function ArenaCover({ name, className }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-primary-container via-deep-teal to-earth-charcoal",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          color: "var(--color-sand-stone)",
        }}
      />
      <span className="relative font-display text-2xl text-on-primary/90">
        {name}
      </span>
    </div>
  );
}
