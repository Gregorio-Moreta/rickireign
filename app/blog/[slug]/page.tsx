import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { PostBody } from "@/components/blog/PostBody";
import { formatDate } from "@/lib/date";
import { slugifyTag } from "@/lib/tags";
import { cn } from "@/lib/cn";

type Params = { slug: string };

/** Pre-render every known post at build time; new posts arrive via 60s ISR. */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs =
    (await sanityFetch<{ slug: string }[]>(POST_SLUGS_QUERY)) ?? [];
  return slugs
    .filter((s): s is { slug: string } => Boolean(s.slug))
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<Post>(POST_QUERY, { slug });
  if (!post) return {};

  // Option B: per-post seo overrides, falling back to derived values.
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.excerpt;
  const ogSource =
    (hasImageAsset(post.seo?.ogImage) && post.seo?.ogImage) ||
    (hasImageAsset(post.coverImage) && post.coverImage) ||
    null;
  const ogImage = ogSource
    ? urlFor(ogSource).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: title ?? undefined,
      description: description ?? undefined,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
  };
}

/** Blog post detail. */
export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await sanityFetch<Post>(POST_QUERY, { slug });
  if (!post) notFound();

  const { title, excerpt, coverImage, body, publishedAt, tags, author } = post;
  const date = formatDate(publishedAt);

  return (
    <Section aria-label={title ?? "Post"}>
      <Container>
        <article className="mx-auto flex max-w-3xl flex-col gap-8">
          <header className="flex flex-col gap-4">
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

            <h1 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-label-md uppercase text-on-surface-variant">
              {date ? <time dateTime={publishedAt}>{date}</time> : null}
              {date && author?.name ? <span aria-hidden="true">·</span> : null}
              {author?.name ? <span>{author.name}</span> : null}
            </div>

            {excerpt ? (
              <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
                {excerpt}
              </p>
            ) : null}
          </header>

          {hasImageAsset(coverImage) ? (
            <SanityImage
              image={coverImage}
              alt={title ?? ""}
              width={1024}
              height={576}
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              className="w-full rounded-xl object-cover shadow-ambient"
            />
          ) : null}

          <PostBody value={body} />

          {tags && tags.length > 0 ? (
            <footer className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant/60 pt-6">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${slugifyTag(tag)}`}
                  className={cn(
                    "inline-flex rounded-full bg-surface-container px-3 py-1",
                    "font-sans text-label-md uppercase text-on-surface-variant",
                    "transition-colors duration-200 hover:text-primary-container",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  )}
                >
                  {tag}
                </Link>
              ))}
            </footer>
          ) : null}
        </article>
      </Container>
    </Section>
  );
}
