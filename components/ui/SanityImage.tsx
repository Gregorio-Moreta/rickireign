import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage as SanityImageRef } from "@/lib/sanity/types";

interface SanityImageProps {
  /** Sanity image reference. When absent, falls back to `fallbackSrc` (if any). */
  image: SanityImageRef | undefined | null;
  /** Required for meaningful images; pass "" only for decorative ones. */
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  /** Above-the-fold images (e.g. the hero portrait) should set this. */
  priority?: boolean;
  /**
   * Static image (a `public/` path) rendered when the Sanity field is empty.
   * Lets a bundled portrait show now while still letting an editor-uploaded
   * Sanity image override it later — no code change needed.
   */
  fallbackSrc?: string;
}

/** Has this Sanity image object actually got an asset to render? */
export function hasImageAsset(image: unknown): boolean {
  return (
    typeof image === "object" &&
    image !== null &&
    "asset" in image &&
    Boolean((image as { asset?: { _ref?: string } }).asset?._ref)
  );
}

/**
 * next/image for portraits. Prefers the Sanity CDN asset (via `urlFor`); when
 * the Sanity field is empty it renders `fallbackSrc`, or `null` if neither
 * exists — so callers can drop it in unconditionally.
 */
export function SanityImage({
  image,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
  fallbackSrc,
}: SanityImageProps) {
  if (!hasImageAsset(image)) {
    if (!fallbackSrc) return null;
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  const src = urlFor(image as SanityImageRef)
    .width(width)
    .height(height)
    .fit("crop")
    .auto("format")
    .url();

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
