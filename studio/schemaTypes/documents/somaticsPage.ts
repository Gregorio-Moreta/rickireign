import { defineType, defineField, defineArrayMember } from "sanity";
import { SparkleIcon } from "@sanity/icons";

/**
 * Somatics page (singleton, fixed _id "somaticsPage").
 *
 * Ricki's *personal* somatic practice — framed as "a little more about me and
 * how I got here", NOT a sales page. This is the one offering that lives on
 * rickireign.com, and the ONLY place a booking CTA appears anywhere on the site
 * (the home page deliberately has none). The "Book a Discovery Call" label is
 * what wires the CTA to the Calendly popup (see CtaButton).
 */
export const somaticsPage = defineType({
  name: "somaticsPage",
  title: "Somatics Page",
  type: "document",
  icon: SparkleIcon,
  fields: [
    defineField({ name: "label", type: "string", initialValue: "The Practice" }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "body",
      title: "Body",
      description: "More about the practice and how she got here.",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "offerings",
      title: "Offerings",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "offering",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "description", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    defineField({
      name: "portrait",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "ctaLabel",
      type: "string",
      initialValue: "Book a Discovery Call",
      description:
        'Keep "Discovery Call" in the label to open the Calendly popup.',
    }),
    defineField({
      name: "ctaTarget",
      type: "string",
      description: "Fallback URL/anchor if the booking popup can't open.",
      initialValue: "/#connect",
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Somatics Page" }) },
});
