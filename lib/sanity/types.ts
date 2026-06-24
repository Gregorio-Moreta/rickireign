import type { ComponentProps } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import { PortableText } from "next-sanity";

/**
 * Hand-written content types for the projections in `queries.ts`.
 *
 * Typegen is not wired up (`sanity typegen`), so these mirror the GROQ shapes
 * by hand. Keep them in sync with `SITE_SETTINGS_QUERY` / `HOME_PAGE_QUERY`.
 * All image fields and most arrays are optional — no assets are seeded yet and
 * editors may leave fields blank, so every consumer must render gracefully
 * without them (see SESSION_STATE.md Phase 2 gotchas).
 */

/** Portable Text value, derived from the component so we don't depend on a
 *  transitive `@portabletext/*` package for the block type. */
export type PortableTextValue = ComponentProps<typeof PortableText>["value"];

/** A Sanity image reference, as returned by GROQ (asset ref + optional crop). */
export type SanityImage = SanityImageSource;

export type CtaStyle = "primary" | "secondary" | "tertiary";

export interface Cta {
  _key: string;
  label: string;
  href: string;
  style?: CtaStyle;
}

export type SocialPlatform = "instagram" | "youtube" | "patreon" | "email";

export interface SocialLink {
  _key: string;
  platform: SocialPlatform;
  url: string;
}

export interface Seo {
  title?: string;
  description?: string;
  ogImage?: SanityImage;
}

export interface SiteSettings {
  wordmark?: string;
  nav?: { _key: string; label: string; anchor: string }[];
  social?: SocialLink[];
  contactEmail?: string;
  footerText?: string;
  seo?: Seo;
}

export interface Hero {
  heading?: string;
  subheading?: string;
  ctas?: Cta[];
  portrait?: SanityImage;
  currentFocus?: { label?: string; items?: string[] };
}

export interface GuidingQuestion {
  _key: string;
  question: string;
  note?: string;
}

export interface Business {
  _id: string;
  name?: string;
  tagline?: string;
  description?: string;
  image?: SanityImage;
  externalUrl?: string;
  order?: number;
}

/** The Somatics card inside The Work — links internally to /somatics. */
export interface SomaticsCard {
  name?: string;
  tagline?: string;
  description?: string;
  linkLabel?: string;
}

/** The Work — merged section (the two businesses + the Somatics card). */
export interface TheWork {
  title?: string;
  intro?: string;
  businesses?: Business[];
  somatics?: SomaticsCard;
}

/** An offering listed on the Somatics page. */
export interface Offering {
  _key: string;
  title: string;
  description?: string;
}

/** The Somatics page (singleton) — practice framed as bio + the only booking CTA. */
export interface SomaticsPage {
  label?: string;
  title?: string;
  intro?: string;
  body?: PortableTextValue;
  offerings?: Offering[];
  portrait?: SanityImage;
  ctaLabel?: string;
  ctaTarget?: string;
  seo?: Seo;
}

export interface About {
  label?: string;
  title?: string;
  body?: PortableTextValue;
  portrait?: SanityImage;
  quote?: string;
}

export interface WhoIsThisFor {
  title?: string;
  points?: string[];
  ctaLabel?: string;
  ctaTarget?: string;
}

export interface SimpleSection {
  title?: string;
  body?: string;
}

export interface Author {
  name?: string;
  image?: SanityImage;
  bio?: string;
}

/** Card-sized post shape (blog index + tag pages). */
export interface PostListItem {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: SanityImage;
  publishedAt?: string;
  tags?: string[];
  author?: Pick<Author, "name" | "image">;
}

/** Full post shape (detail page). */
export interface Post extends PostListItem {
  body?: PortableTextValue;
  author?: Author;
  seo?: Seo;
}

export interface HomePage {
  hero?: Hero;
  guidingQuestions?: GuidingQuestion[];
  theWork?: TheWork;
  about?: About;
  whoIsThisFor?: WhoIsThisFor;
  newsletter?: SimpleSection;
  connect?: SimpleSection;
  seo?: Seo;
}
