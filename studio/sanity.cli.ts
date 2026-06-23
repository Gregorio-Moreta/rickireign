import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "zsuyhr45",
    dataset: "production",
  },
  // Hosted Studio at https://rickireign.sanity.studio — the no-code editor URL
  // for non-technical content editors (add/edit/remove posts in the browser).
  studioHost: "rickireign",
  deployment: { appId: "hga8d382gaj90mnlkql72mpe" },
  autoUpdates: true,
});
