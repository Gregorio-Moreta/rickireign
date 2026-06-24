import { defineType, defineField } from "sanity";
import { TagIcon } from "@sanity/icons";

/**
 * Post tag — a managed document (replaces the old free-text string tags) so
 * editors can add/rename/remove tags no-code in the Studio. The slug is the
 * URL segment for /journal/tag/<slug>; it's enforced URL-safe so a tag with a
 * space can never 404 the route.
 */
export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          const current = value?.current;
          if (current && !/^[a-z0-9-]+$/.test(current)) {
            return "Slug may only contain lowercase letters, numbers, and hyphens.";
          }
          return true;
        }),
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
