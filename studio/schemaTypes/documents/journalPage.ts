import { defineType, defineField } from "sanity";
import { DocumentsIcon } from "@sanity/icons";

/**
 * Journal index page (singleton, fixed _id "journalPage").
 *
 * The intro copy + SEO for /journal. Post cards themselves come from `post`
 * documents; this is only the page chrome (eyebrow, heading, intro, the
 * empty-state line) plus the list's meta title/description. Every field has an
 * in-code fallback, so leaving one blank is safe.
 */
export const journalPage = defineType({
  name: "journalPage",
  title: "Journal Page",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "Journal" }),
    defineField({ name: "heading", type: "string", initialValue: "Essays & notes" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "emptyState",
      title: "Empty-state message",
      type: "string",
      initialValue: "No posts yet — check back soon.",
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Journal Page" }) },
});
