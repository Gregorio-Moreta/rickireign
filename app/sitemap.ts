import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_QUERY, TAGS_QUERY } from "@/lib/sanity/queries";
import type { PostListItem, Tag } from "@/lib/sanity/types";

const BASE_URL = "https://rickireign.com";

/** Static routes + every published post + every tag page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    sanityFetch<PostListItem[]>(POSTS_QUERY),
    sanityFetch<Tag[]>(TAGS_QUERY),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/somatics`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/journal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts ?? [])
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${BASE_URL}/journal/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const tagRoutes: MetadataRoute.Sitemap = (tags ?? [])
    .filter((tag): tag is Tag & { slug: string } => Boolean(tag.slug))
    .map((tag) => ({
      url: `${BASE_URL}/journal/tag/${tag.slug}`,
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
