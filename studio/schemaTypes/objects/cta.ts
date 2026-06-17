import { defineType, defineField } from "sanity";
import { LinkIcon } from "@sanity/icons";

export const cta = defineType({
  name: "cta",
  title: "Call to Action",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      type: "string",
      description: "Full URL, mailto:, in-page anchor (#practice), or path (/blog)",
      validation: (rule) =>
        rule.required().custom((value) =>
          typeof value === "string" && /^(https?:\/\/|mailto:|#|\/)/.test(value)
            ? true
            : "Must start with http(s)://, mailto:, # (anchor), or / (path)",
        ),
    }),
    defineField({
      name: "style",
      type: "string",
      options: {
        list: [
          { title: "Primary (forest)", value: "primary" },
          { title: "Secondary (outline)", value: "secondary" },
          { title: "Tertiary (teal text)", value: "tertiary" },
        ],
        layout: "radio",
      },
      initialValue: "primary",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "style" } },
});
