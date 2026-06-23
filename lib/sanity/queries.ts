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

/** The single home-page document, with referenced businesses expanded. */
export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{
  hero,
  guidingQuestions,
  practice,
  foundedAndLed{
    title,
    intro,
    businesses[]->{ _id, name, tagline, description, image, externalUrl, order }
  },
  about,
  whoIsThisFor,
  newsletter,
  connect,
  seo
}`);

/** All businesses (Exhale Under Pressure, Community Birth Village), ordered. */
export const BUSINESSES_QUERY = defineQuery(`*[_type == "business"] | order(order asc){
  _id, name, tagline, description, image, externalUrl, order
}`);

/** Card-sized fields shared by the blog list + tag pages. */
const POST_CARD_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  tags,
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
  tags,
  author->{ name, image, bio },
  seo
}`);

/** All published post slugs, for generateStaticParams. */
export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current
}`);

/** Published posts carrying a given tag (exact display string), newest first.
 *  Param is `tagName`, not `tag` — `tag` is a reserved key in QueryParams. */
export const POSTS_BY_TAG_QUERY = defineQuery(`*[_type == "post" && defined(slug.current) && $tagName in tags]
  | order(publishedAt desc){${POST_CARD_PROJECTION}}`);

/** Distinct tags across all published posts (for tag-page static params). */
export const TAGS_QUERY = defineQuery(`array::unique(*[_type == "post" && defined(slug.current)].tags[])`);
