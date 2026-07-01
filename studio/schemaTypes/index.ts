import { cta } from "./objects/cta";
import { seo } from "./objects/seo";
import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { somaticsPage } from "./documents/somaticsPage";
import { journalPage } from "./documents/journalPage";
import { business } from "./documents/business";
import { author } from "./documents/author";
import { post } from "./documents/post";
import { tag } from "./documents/tag";

export const schemaTypes = [
  // Reusable objects
  cta,
  seo,
  // Documents
  siteSettings,
  homePage,
  somaticsPage,
  journalPage,
  business,
  author,
  post,
  tag,
];
