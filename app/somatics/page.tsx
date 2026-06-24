import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/ui/CtaButton";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SOMATICS_PAGE_QUERY } from "@/lib/sanity/queries";
import type { SomaticsPage } from "@/lib/sanity/types";

/**
 * /somatics — Ricki's personal somatic practice, framed as bio ("a little more
 * about me and how I got here"), NOT a sales page. This is the one offering
 * that lives on rickireign.com and the ONLY page that carries a booking CTA —
 * placed at the very end, after the work is introduced (the home page has none).
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

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<SomaticsPage>(SOMATICS_PAGE_QUERY);
  const title = page?.seo?.title || page?.title || "Somatics";
  const description =
    page?.seo?.description ||
    page?.intro ||
    "Ricki Reign's personal somatic and leadership practice.";
  return { title, description };
}

export default async function SomaticsPage() {
  const page = await sanityFetch<SomaticsPage>(SOMATICS_PAGE_QUERY);
  if (!page) return null;

  const { label, title, intro, body, offerings, portrait, ctaLabel, ctaTarget } =
    page;
  const hasBody = Array.isArray(body) && body.length > 0;
  const items = (offerings ?? []).filter((o) => o.title);
  const showPortrait = hasImageAsset(portrait);

  return (
    <Section aria-label={title ?? "Somatics"} className="pt-16 md:pt-24">
      <Container className="flex flex-col gap-stack">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-gutter">
          <div className={showPortrait ? "lg:col-span-7" : "max-w-3xl lg:col-span-12"}>
            <header className="flex flex-col gap-4">
              {label ? (
                <p className="font-sans text-label-md uppercase text-secondary">
                  {label}
                </p>
              ) : null}
              {title ? (
                <h1 className="max-w-2xl font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
                  {title}
                </h1>
              ) : null}
              {intro ? (
                <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant text-pretty">
                  {intro}
                </p>
              ) : null}
            </header>

            {hasBody ? (
              <div className="mt-8 flex max-w-2xl flex-col gap-4">
                <PortableText value={body} components={bodyComponents} />
              </div>
            ) : null}
          </div>

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
        </div>

        {items.length > 0 ? (
          <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <li
                key={item._key}
                className="flex h-full flex-col gap-4 rounded-lg border border-primary-container/10 bg-surface-container-lowest p-7"
              >
                <span
                  aria-hidden="true"
                  className="font-sans text-label-md uppercase text-secondary"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-headline-md text-on-surface">
                  {item.title}
                </h2>
                {item.description ? (
                  <p className="font-sans text-body-md text-on-surface-variant">
                    {item.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {ctaLabel ? (
          <div className="mt-2">
            <CtaButton
              label={ctaLabel}
              target={ctaTarget || "/#connect"}
              style="primary"
            />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
