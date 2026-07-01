import type { StructureResolver } from "sanity/structure";
import { CogIcon, HomeIcon, SparkleIcon, DocumentsIcon } from "@sanity/icons";

// Singletons pinned to a fixed document id; collections listed below the divider.
const SINGLETONS = [
  { id: "siteSettings", type: "siteSettings", title: "Site Settings", icon: CogIcon },
  { id: "homePage", type: "homePage", title: "Home Page", icon: HomeIcon },
  { id: "somaticsPage", type: "somaticsPage", title: "Somatics Page", icon: SparkleIcon },
  { id: "journalPage", type: "journalPage", title: "Journal Page", icon: DocumentsIcon },
] as const;

const COLLECTIONS = ["business", "post", "author", "tag"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map((s) =>
        S.listItem()
          .title(s.title)
          .icon(s.icon)
          .id(s.id)
          .child(S.document().schemaType(s.type).documentId(s.id)),
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) =>
        COLLECTIONS.includes(item.getId() as string),
      ),
    ]);
