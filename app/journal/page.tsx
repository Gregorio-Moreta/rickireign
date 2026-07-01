import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_QUERY, JOURNAL_PAGE_QUERY } from "@/lib/sanity/queries";
import type { PostListItem, JournalPage } from "@/lib/sanity/types";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PostGrid } from "@/components/blog/PostGrid";

// Editorial chrome from Sanity (journalPage) with in-code fallbacks.
const FALLBACK = {
  eyebrow: "Journal",
  heading: "Essays & notes",
  intro:
    "Reflections on somatic leadership, ancestral wisdom, and the work of building organizations with care.",
  emptyState: "No posts yet — check back soon.",
  metaTitle: "Journal",
  metaDescription:
    "Essays and notes from Ricki Reign on somatic leadership, ancestral wisdom, and the work of building organizations with care.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<JournalPage>(JOURNAL_PAGE_QUERY);
  const title = page?.seo?.title || FALLBACK.metaTitle;
  const description = page?.seo?.description || FALLBACK.metaDescription;

  return {
    title,
    description,
    alternates: { canonical: "/journal" },
    openGraph: {
      title: `${title} — Ricki Reign`,
      description,
      url: "/journal",
      type: "website",
    },
  };
}

/** Blog index — all published posts, newest first. */
export default async function BlogIndex() {
  const [posts, page] = await Promise.all([
    sanityFetch<PostListItem[]>(POSTS_QUERY),
    sanityFetch<JournalPage>(JOURNAL_PAGE_QUERY),
  ]);
  const items = posts ?? [];

  return (
    <Section aria-label={page?.eyebrow || FALLBACK.eyebrow}>
      <Container>
        <header className="flex max-w-2xl flex-col gap-4">
          <p className="font-sans text-label-md uppercase text-secondary">
            {page?.eyebrow || FALLBACK.eyebrow}
          </p>
          <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
            {page?.heading || FALLBACK.heading}
          </h1>
          <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
            {page?.intro || FALLBACK.intro}
          </p>
        </header>

        <div className="mt-12">
          {items.length > 0 ? (
            <PostGrid posts={items} />
          ) : (
            <p className="font-sans text-body-lg text-on-surface-variant">
              {page?.emptyState || FALLBACK.emptyState}
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
