import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage, PortableTextValue } from "@/lib/sanity/types";

/**
 * Rich Portable Text renderer for `post.body`. Builds on the same
 * PortableText + component-map pattern as MeetReign, but covers the full set of
 * marks/blocks an editor can produce: headings, blockquote, lists, links, and
 * inline images (the `body` schema allows image members). Brand tokens only.
 */

/** Sanity image asset refs encode dimensions: `image-<id>-<W>x<H>-<fmt>`. */
function dimensionsFromRef(ref: string | undefined): { width: number; height: number } {
  const fallback = { width: 1280, height: 853 };
  const match = ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return fallback;
  return { width: Number(match[1]), height: Number(match[2]) };
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-sans text-body-lg text-on-surface-variant text-pretty">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-6 font-display text-headline-md text-on-surface text-balance">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-4 font-display text-headline-md/snug text-on-surface text-balance">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-luminous-teal pl-6 font-display italic text-quote text-on-surface text-balance">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex list-disc flex-col gap-2 pl-6 font-sans text-body-lg text-on-surface-variant">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex list-decimal flex-col gap-2 pl-6 font-sans text-body-lg text-on-surface-variant">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="text-on-surface">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-secondary underline underline-offset-4 hover:text-luminous-teal"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const image = value as SanityImage & { asset?: { _ref?: string }; alt?: string };
      const ref = image.asset?._ref;
      if (!ref) return null;
      const { width, height } = dimensionsFromRef(ref);
      return (
        <figure className="my-2">
          <Image
            src={urlFor(image).width(1280).fit("max").auto("format").url()}
            alt={image.alt ?? ""}
            width={width}
            height={height}
            sizes="(min-width: 768px) 768px, 100vw"
            className="w-full rounded-lg"
          />
        </figure>
      );
    },
  },
};

export function PostBody({ value }: { value: PortableTextValue | undefined }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div className="flex flex-col gap-5">
      <PortableText value={value} components={components} />
    </div>
  );
}
