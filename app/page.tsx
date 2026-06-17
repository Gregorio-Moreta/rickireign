import { sanityFetch } from "@/lib/sanity/fetch";
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { HomePage, SiteSettings } from "@/lib/sanity/types";
import { Hero } from "@/components/sections/Hero";
import { GuidingQuestions } from "@/components/sections/GuidingQuestions";
import { PracticeSection } from "@/components/sections/PracticeSection";
import { FoundedAndLed } from "@/components/sections/FoundedAndLed";
import { MeetReign } from "@/components/sections/MeetReign";
import { WhoIsThisFor } from "@/components/sections/WhoIsThisFor";
import { Newsletter } from "@/components/sections/Newsletter";
import { Connect } from "@/components/sections/Connect";

/**
 * Home — the single-scroll page. Server Component: fetches the published
 * homePage + siteSettings from Sanity and hands each section its slice of data.
 * Sections render gracefully when their fields are empty (no assets seeded).
 */
export default async function Home() {
  const [home, settings] = await Promise.all([
    sanityFetch<HomePage>(HOME_PAGE_QUERY),
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY),
  ]);

  if (!home) return null;

  return (
    <>
      <Hero data={home.hero} />
      <GuidingQuestions questions={home.guidingQuestions} />
      <PracticeSection data={home.practice} />
      <FoundedAndLed data={home.foundedAndLed} />
      <MeetReign data={home.about} />
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
