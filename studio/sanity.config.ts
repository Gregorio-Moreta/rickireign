import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

// Single-instance documents managed via Structure (no create/duplicate/delete).
const SINGLETON_TYPES = new Set(["siteSettings", "homePage"]);

export default defineConfig({
  name: "default",
  title: "Ricki Reign",
  projectId: "zsuyhr45",
  dataset: "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Remove singletons from the global "create new" templates.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // Lock singleton actions to publish/discard/restore only.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : input,
  },
});
