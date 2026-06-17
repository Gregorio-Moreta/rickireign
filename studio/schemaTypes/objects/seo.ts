import { defineType, defineField } from "sanity";
import { SearchIcon } from "@sanity/icons";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "SEO Title",
      validation: (rule) => rule.max(60).warning("Keep under ~60 characters"),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      title: "Meta Description",
      validation: (rule) => rule.max(160).warning("Keep under ~160 characters"),
    }),
    defineField({
      name: "ogImage",
      type: "image",
      title: "Social Share Image",
      options: { hotspot: true },
    }),
  ],
});
