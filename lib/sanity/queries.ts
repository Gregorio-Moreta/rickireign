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
  ...,
  foundedAndLed{
    ...,
    businesses[]->{ _id, name, tagline, description, image, externalUrl, order }
  }
}`);

/** All businesses (Exhale Under Pressure, Community Birth Village), ordered. */
export const BUSINESSES_QUERY = defineQuery(`*[_type == "business"] | order(order asc){
  _id, name, tagline, description, image, externalUrl, order
}`);
