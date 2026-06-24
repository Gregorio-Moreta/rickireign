import { cta } from "./objects/cta";
import { seo } from "./objects/seo";
import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { somaticsPage } from "./documents/somaticsPage";
import { business } from "./documents/business";
import { author } from "./documents/author";
import { post } from "./documents/post";

export const schemaTypes = [
  // Reusable objects
  cta,
  seo,
  // Documents
  siteSettings,
  homePage,
  somaticsPage,
  business,
  author,
  post,
];
