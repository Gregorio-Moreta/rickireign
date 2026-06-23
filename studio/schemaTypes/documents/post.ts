import { defineType, defineField, defineArrayMember } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

// Preset tag taxonomy — editors pick from these so tags stay consistent and the
// `/blog/tag/<slug>` pages group correctly (no "Essay" vs "essays" drift). To add
// a tag in the future, append here, then `npm run schema:deploy` + redeploy the
// Studio. (For fully no-code tag management, promote tags to a reference doc type.)
export const POST_TAGS = [
  "Essay",
  "Note",
  "Somatic Leadership",
  "Ancestral Wisdom",
  "Organizational Leadership",
  "Practice",
  "Community",
  "Ritual & Rest",
] as const;

// Blog post — Phase 4, modelled now so the content type exists.
export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", type: "text", rows: 3 }),
    defineField({
      name: "coverImage",
      type: "image",
      options: {
        hotspot: true,
        // Enables the one-click "Generate" AI action on this image, using the
        // `instruction` prompt below. (Requires the `assist()` plugin.)
        aiAssist: { imageInstructionField: "instruction" },
      },
      fields: [
        defineField({
          type: "text",
          name: "instruction",
          title: "AI image prompt",
          rows: 3,
          description:
            "Optional. Use the ✨ Generate action on the image to create an on-brand cover. Add a line about this article's theme to steer it; the brand style is pre-filled.",
          initialValue:
            "An abstract, calm, premium editorial cover in the 'Ancestral Modernity' palette — deep forest green, warm sandstone, and a subtle luminous-teal accent; soft natural light, fine organic texture. No text, no people, no faces. Reflect the theme of this article: ",
        }),
      ],
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
        list: POST_TAGS.map((tag) => ({ title: tag, value: tag })),
      },
    }),
    // Optional per-post SEO overrides. Left blank, the app derives metadata from
    // title / excerpt / coverImage (see app/blog/[slug]/page.tsx).
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
