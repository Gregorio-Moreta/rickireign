import { defineType, defineField, defineArrayMember } from "sanity";
import { HomeIcon } from "@sanity/icons";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: HomeIcon,
  fields: [
    // 1. Hero
    defineField({
      name: "hero",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "subheading", type: "text", rows: 2 }),
        defineField({
          name: "ctas",
          title: "CTAs",
          type: "array",
          of: [defineArrayMember({ type: "cta" })],
          validation: (rule) => rule.max(2),
        }),
        defineField({
          name: "portrait",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "currentFocus",
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              initialValue: "Current Focus",
            }),
            defineField({
              name: "items",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
          ],
        }),
      ],
    }),
    // 2. Guiding Questions
    defineField({
      name: "guidingQuestions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "guidingQuestion",
          fields: [
            defineField({
              name: "question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "note", type: "string" }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    // 3. The Work — merged section (replaces the old "The Practice" + "Founded
    // & Led"). One leadership identity expressed across three arenas: the two
    // businesses (Exhale, CBV — each links to its own site) and Somatics (links
    // to the internal /somatics page). The page EXPLAINS; it does not sell, so
    // there is intentionally no booking CTA here.
    defineField({
      name: "theWork",
      title: "The Work",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({
          name: "intro",
          type: "text",
          rows: 3,
          description:
            "Frame the single identity (leadership strategist) → three arenas.",
        }),
        defineField({
          name: "businesses",
          title: "Businesses (Exhale, Community Birth Village)",
          type: "array",
          of: [
            defineArrayMember({ type: "reference", to: [{ type: "business" }] }),
          ],
        }),
        defineField({
          name: "somaticsImage",
          title: "Somatics card image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "somatics",
          title: "Somatics card (links to /somatics)",
          type: "object",
          options: { collapsible: true, collapsed: false },
          fields: [
            defineField({ name: "name", type: "string", initialValue: "Somatics" }),
            defineField({ name: "tagline", type: "string" }),
            defineField({ name: "description", type: "text", rows: 2 }),
            defineField({
              name: "linkLabel",
              type: "string",
              initialValue: "Learn more",
            }),
          ],
        }),
      ],
    }),
    // 5. Meet Reign (about)
    defineField({
      name: "about",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "label", type: "string", initialValue: "Meet Reign" }),
        defineField({ name: "title", type: "string" }),
        defineField({
          name: "body",
          type: "array",
          of: [defineArrayMember({ type: "block" })],
        }),
        defineField({
          name: "portrait",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({ name: "quote", type: "text", rows: 2 }),
      ],
    }),
    // 6. Who is this for?
    defineField({
      name: "whoIsThisFor",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({
          name: "points",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({ name: "ctaLabel", type: "string" }),
        defineField({ name: "ctaTarget", type: "string" }),
      ],
    }),
    // 7. Join the list (newsletter)
    defineField({
      name: "newsletter",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({ name: "body", type: "text", rows: 2 }),
      ],
    }),
    // 8. Connect
    defineField({
      name: "connect",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({ name: "body", type: "text", rows: 2 }),
      ],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
