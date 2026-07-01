import { defineType, defineField, defineArrayMember } from "sanity";
import { CogIcon } from "@sanity/icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "wordmark",
      type: "string",
      initialValue: "Ricki Reign",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "nav",
      title: "Navigation",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "navItem",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "anchor",
              type: "string",
              description: "In-page anchor, e.g. #practice",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "anchor" } },
        }),
      ],
    }),
    defineField({
      name: "social",
      title: "Social Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              options: {
                list: [
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Patreon", value: "patreon" },
                  { title: "Email", value: "email" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              type: "url",
              validation: (rule) =>
                rule.uri({ scheme: ["http", "https", "mailto"] }).required(),
            }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "footerText", type: "string" }),
    // Cookie-consent modal copy. The `/privacy` link and the "Cookie settings"
    // reference are rendered structurally in code; only the prose is editable
    // here. Every field has an in-code fallback, so leaving one blank is safe.
    defineField({
      name: "consent",
      title: "Cookie consent modal",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", type: "string", initialValue: "A note on cookies" }),
        defineField({
          name: "body",
          type: "text",
          rows: 3,
          description:
            'The "See our Privacy Policy" link is appended automatically.',
        }),
        defineField({ name: "acceptLabel", type: "string", initialValue: "Accept" }),
        defineField({ name: "declineLabel", type: "string", initialValue: "Decline" }),
        defineField({
          name: "cookieSettingsLabel",
          title: "Footer re-open link label",
          type: "string",
          initialValue: "Cookie settings",
        }),
      ],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
