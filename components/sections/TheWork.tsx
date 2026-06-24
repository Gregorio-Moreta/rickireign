import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { cn } from "@/lib/cn";
import type { Business, SanityImage as SanityImageRef, TheWork as TheWorkData } from "@/lib/sanity/types";

/**
 * Section 3 — The Work. The merged section that replaced "The Practice" +
 * "Founded & Led". One leadership identity expressed across three arenas:
 * Somatics first (it lives on this site → /somatics), then Exhale Under
 * Pressure and Community Birth Village (each links out to its own site). This
 * section EXPLAINS the work so a visitor understands each arena before clicking
 * — there is deliberately no booking CTA here (booking lives only on /somatics).
 *
 * Cards are strictly uniform: a fixed 16:9 media area, then title / tagline /
 * description on reserved (clamped) heights so every card aligns and the link
 * pins to a common bottom edge.
 */
export function TheWork({ data }: { data: TheWorkData | undefined }) {
  if (!data) return null;

  const businesses = (data.businesses ?? []).filter((b) => b.name);
  const somatics = data.somatics;
  const hasCards = Boolean(somatics?.name) || businesses.length > 0;

  return (
    <Section id="work" tone="alt" aria-label={data.title ?? "The work"}>
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
          <ul className="grid items-stretch gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {/* Somatics first — it's the one that lives on this site. */}
            {somatics?.name ? (
              <ArenaCard
                name={somatics.name}
                tagline={somatics.tagline}
                description={somatics.description}
                image={data.somaticsImage}
                href="/somatics"
                linkLabel={somatics.linkLabel ?? "Learn more"}
                external={false}
              />
            ) : null}
            {businesses.map((business) => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

/** Shared, fixed-height card chrome so the three arenas read as one even row. */
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
  image?: SanityImageRef;
  href: string;
  linkLabel: string;
  external: boolean;
}) {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-primary-container/10 bg-surface-container-lowest shadow-ambient">
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
        <h3 className="line-clamp-1 min-h-[1lh] font-display text-headline-md text-on-surface">
          {name}
        </h3>
        <p className="line-clamp-1 min-h-[1lh] font-display italic text-body-lg text-on-surface-variant">
          {tagline ?? " "}
        </p>
        <p className="line-clamp-3 min-h-[3lh] font-sans text-body-md text-on-surface-variant text-pretty">
          {description ?? " "}
        </p>
        <div className="mt-auto pt-2">
          <Button
            href={href}
            variant="tertiary"
            target={external ? "_blank" : undefined}
            aria-label={
              external ? `Visit ${name} (opens in a new tab)` : `${linkLabel}: ${name}`
            }
          >
            {linkLabel}
          </Button>
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

/**
 * On-brand placeholder for an arena with no image — a layered Forest-Green →
 * Deep-Teal field lit by a soft luminous-teal glow, with the subtle dotted
 * "ancestral grid" texture. Reads as an intentional cover, not a flat panel.
 * (Silent safety net once AI/uploaded card images exist.)
 */
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
      {/* Soft luminous-teal glow, off-centre, for depth. */}
      <div
        className="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--color-luminous-teal)" }}
      />
      {/* Dotted ancestral-grid texture. */}
      <div
        className="absolute inset-0 opacity-[0.16]"
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
