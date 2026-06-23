import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_QUERY, TAGS_QUERY } from "@/lib/sanity/queries";
import type { PostListItem } from "@/lib/sanity/types";
import { slugifyTag } from "@/lib/tags";

const BASE_URL = "https://rickireign.com";

/** Static routes + every published post + every tag page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    sanityFetch<PostListItem[]>(POSTS_QUERY),
    sanityFetch<string[]>(TAGS_QUERY),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts ?? [])
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const tagRoutes: MetadataRoute.Sitemap = (tags ?? [])
    .filter((tag): tag is string => typeof tag === "string" && tag.length > 0)
    .map((tag) => ({
      url: `${BASE_URL}/blog/tag/${slugifyTag(tag)}`,
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
