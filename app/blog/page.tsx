import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_QUERY } from "@/lib/sanity/queries";
import type { PostListItem } from "@/lib/sanity/types";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PostGrid } from "@/components/blog/PostGrid";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Essays and notes from Ricki Reign on somatic leadership, ancestral wisdom, and the work of building organizations with care.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Journal — Ricki Reign",
    description:
      "Essays and notes from Ricki Reign on somatic leadership, ancestral wisdom, and the work of building organizations with care.",
    url: "/blog",
    type: "website",
  },
};

/** Blog index — all published posts, newest first. */
export default async function BlogIndex() {
  const posts = (await sanityFetch<PostListItem[]>(POSTS_QUERY)) ?? [];

  return (
    <Section aria-label="Journal">
      <Container>
        <header className="flex max-w-2xl flex-col gap-4">
          <p className="font-sans text-label-md uppercase text-secondary">
            Journal
          </p>
          <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
            Essays &amp; notes
          </h1>
          <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
            Reflections on somatic leadership, ancestral wisdom, and the work of
            building organizations with care.
          </p>
        </header>

        <div className="mt-12">
          {posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <p className="font-sans text-body-lg text-on-surface-variant">
              No posts yet — check back soon.
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
