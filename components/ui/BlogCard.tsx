import Link from "next/link";
import { SanityImage, hasImageAsset } from "@/components/ui/SanityImage";
import { CoverFallback } from "@/components/ui/CoverFallback";
import { formatDate } from "@/lib/date";
import { slugifyTag } from "@/lib/tags";
import { cn } from "@/lib/cn";
import type { PostListItem } from "@/lib/sanity/types";

/**
 * Blog index / tag-page card. Whole card is clickable (title link + an
 * `after:absolute` overlay), while tags remain independently clickable via a
 * higher stacking context — a valid, accessible alternative to nesting <a>s.
 * Degrades gracefully when no cover image is seeded (text-only card).
 */
export function BlogCard({ post }: { post: PostListItem }) {
  const { title, slug, excerpt, coverImage, publishedAt, tags } = post;
  const date = formatDate(publishedAt);
  const hasCover = hasImageAsset(coverImage);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4",
        "rounded-lg focus-within:ring-2 focus-within:ring-primary-container",
        "focus-within:ring-offset-2 focus-within:ring-offset-surface",
      )}
    >
      {/* Always render a 3:2 cover so the grid stays uniform; posts without an
          uploaded image get the branded fallback. */}
      <div className="overflow-hidden rounded-lg bg-surface-container">
        {hasCover ? (
          <SanityImage
            image={coverImage}
            alt={title ?? ""}
            width={720}
            height={480}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "aspect-[3/2] w-full object-cover",
              "transition-transform duration-500 ease-out group-hover:scale-[1.03]",
              "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            )}
          />
        ) : (
          <CoverFallback
            className={cn(
              "transition-transform duration-500 ease-out group-hover:scale-[1.03]",
              "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            )}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {date ? (
          <time
            dateTime={publishedAt}
            className="font-sans text-label-md uppercase text-secondary"
          >
            {date}
          </time>
        ) : null}

        <h3 className="line-clamp-2 min-h-[2lh] font-display text-headline-md text-on-surface">
          {slug ? (
            <Link
              href={`/journal/${slug}`}
              className={cn(
                "transition-colors duration-200 hover:text-primary-container",
                "after:absolute after:inset-0 after:rounded-lg",
                "focus-visible:outline-none",
              )}
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        {excerpt ? (
          <p className="line-clamp-3 min-h-[3lh] font-sans text-body-md text-on-surface-variant text-pretty">
            {excerpt}
          </p>
        ) : null}

        {tags && tags.length > 0 ? (
          <ul className="relative z-10 mt-auto flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/journal/tag/${slugifyTag(tag)}`}
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
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
