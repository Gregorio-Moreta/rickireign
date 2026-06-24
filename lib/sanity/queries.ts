import { defineQuery } from "next-sanity";

/** Global site chrome (nav, socials, footer, default SEO). */
export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  wordmark,
  nav,
  social,
  contactEmail,
  footerText,
  seo
}`);

/** The single home-page document, with The Work's businesses expanded. */
export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{
  hero,
  guidingQuestions,
  theWork{
    title,
    intro,
    businesses[]->{ _id, name, tagline, description, image, externalUrl, order },
    somaticsImage,
    somatics{ name, tagline, description, linkLabel }
  },
  about,
  whoIsThisFor,
  newsletter,
  connect,
  seo
}`);

/** The Somatics page (singleton) — the practice, framed as bio, with the only
 *  booking CTA on the whole site. */
export const SOMATICS_PAGE_QUERY = defineQuery(`*[_type == "somaticsPage"][0]{
  label,
  title,
  intro,
  body,
  offerings,
  portrait,
  ctaLabel,
  ctaTarget,
  seo
}`);

/** All businesses (Exhale Under Pressure, Community Birth Village), ordered. */
export const BUSINESSES_QUERY = defineQuery(`*[_type == "business"] | order(order asc){
  _id, name, tagline, description, image, externalUrl, order
}`);

/** Tag reference, expanded to its display title + URL slug. */
const TAG_PROJECTION = `tags[]->{ "title": title, "slug": slug.current }`;

/** Card-sized fields shared by the blog list + tag pages. */
const POST_CARD_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  ${TAG_PROJECTION},
  author->{ name, image }
`;

/** All published posts, newest first (blog index). */
export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]
  | order(publishedAt desc){${POST_CARD_PROJECTION}}`);

/** A single post by slug, with body + per-post SEO + expanded author. */
export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  body,
  publishedAt,
  ${TAG_PROJECTION},
  author->{ name, image, bio },
  seo
}`);

/** All published post slugs, for generateStaticParams. */
export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current
}`);

/** Published posts referencing a tag with the given slug, newest first.
 *  Param is `tagSlug`, not `tag` — `tag` is a reserved key in QueryParams. */
export const POSTS_BY_TAG_QUERY = defineQuery(`*[_type == "post" && defined(slug.current) && $tagSlug in tags[]->slug.current]
  | order(publishedAt desc){${POST_CARD_PROJECTION}}`);

/** All tags, for tag-page static params + slug→title resolution. */
export const TAGS_QUERY = defineQuery(`*[_type == "tag" && defined(slug.current)]
  | order(title asc){ "title": title, "slug": slug.current }`);

/** A single tag by slug (for the tag page title/metadata). */
export const TAG_BY_SLUG_QUERY = defineQuery(`*[_type == "tag" && slug.current == $tagSlug][0]{
  "title": title, "slug": slug.current
}`);
