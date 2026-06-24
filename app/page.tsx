import { sanityFetch } from "@/lib/sanity/fetch";
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { HomePage, SiteSettings } from "@/lib/sanity/types";
import { Hero } from "@/components/sections/Hero";
import { GuidingQuestions } from "@/components/sections/GuidingQuestions";
import { MeetReign } from "@/components/sections/MeetReign";
import { TheWork } from "@/components/sections/TheWork";
import { WhoIsThisFor } from "@/components/sections/WhoIsThisFor";
import { Newsletter } from "@/components/sections/Newsletter";
import { Connect } from "@/components/sections/Connect";
import { HashScroll } from "@/components/layout/HashScroll";

/**
 * Home — the single-scroll page. Server Component: fetches the published
 * homePage + siteSettings from Sanity and hands each section its slice of data.
 * Sections render gracefully when their fields are empty (no assets seeded).
 */
export default async function Home() {
  // siteSettings is also fetched in the layout (for Nav/Footer); we re-fetch it
  // here for the Connect section's social + contactEmail. Next dedupes identical
  // fetch-backed requests within a render, so this is one network call.
  const [home, settings] = await Promise.all([
    sanityFetch<HomePage>(HOME_PAGE_QUERY),
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY),
  ]);

  if (!home) return null;

  return (
    <>
      <HashScroll />
      <Hero data={home.hero} />
      <GuidingQuestions questions={home.guidingQuestions} />
      <MeetReign data={home.about} />
      <TheWork data={home.theWork} />
      <WhoIsThisFor data={home.whoIsThisFor} />
      <Newsletter data={home.newsletter} />
      <Connect
        data={home.connect}
        social={settings?.social}
        contactEmail={settings?.contactEmail}
      />
    </>
  );
}
