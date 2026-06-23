import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_BY_TAG_QUERY, TAGS_QUERY } from "@/lib/sanity/queries";
import type { PostListItem } from "@/lib/sanity/types";
import { slugifyTag, resolveTagSlug } from "@/lib/tags";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PostGrid } from "@/components/blog/PostGrid";
import { cn } from "@/lib/cn";

type Params = { tag: string };

/** Pre-render a page for every distinct tag. */
export async function generateStaticParams(): Promise<Params[]> {
  const tags = (await sanityFetch<string[]>(TAGS_QUERY)) ?? [];
  return tags
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .map((tag) => ({ tag: slugifyTag(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tags = (await sanityFetch<string[]>(TAGS_QUERY)) ?? [];
  const tag = resolveTagSlug(tagSlug, tags);
  if (!tag) return {};

  const title = `${tag} — Journal`;
  const description = `Essays and notes from Ricki Reign tagged "${tag}".`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${tagSlug}` },
    openGraph: { title, description, url: `/blog/tag/${tagSlug}`, type: "website" },
  };
}

/** Tag-filtered post list. */
export default async function TagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tag: tagSlug } = await params;
  const tags = (await sanityFetch<string[]>(TAGS_QUERY)) ?? [];
  const tag = resolveTagSlug(tagSlug, tags);
  if (!tag) notFound();

  const posts =
    (await sanityFetch<PostListItem[]>(POSTS_BY_TAG_QUERY, { tagName: tag })) ??
    [];

  return (
    <Section aria-label={`Posts tagged ${tag}`}>
      <Container>
        <header className="flex max-w-2xl flex-col gap-4">
          <Link
            href="/blog"
            className={cn(
              "self-start font-sans text-label-md uppercase text-secondary",
              "transition-colors duration-200 hover:text-luminous-teal",
              "rounded-sm focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            )}
          >
            ← Journal
          </Link>
          <p className="font-sans text-label-md uppercase text-secondary">
            Tagged
          </p>
          <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
            {tag}
          </h1>
        </header>

        <div className="mt-12">
          {posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <p className="font-sans text-body-lg text-on-surface-variant">
              No posts with this tag yet.
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
