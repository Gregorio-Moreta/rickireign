import { defineType, defineField } from "sanity";
import { CaseIcon } from "@sanity/icons";

// Exhale Under Pressure, Community Birth Village — businesses Ricki founded/leads.
export const business = defineType({
  name: "business",
  title: "Business",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "description", type: "text", rows: 4 }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "externalUrl",
      type: "url",
      title: "Book / Visit URL",
      description: "Where this business is booked (its own site)",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "name", subtitle: "tagline", media: "image" } },
});
