import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

/**
 * Phase 0 foundation skeleton. Proves the token system renders end to end —
 * Caslon display heading, Hanken body copy, and all three Button variants.
 * The real home sections (Hero → Who is this for) are built in Phase 2.
 */
export default function Home() {
  return (
    <Section id="practice" aria-label="Foundation preview">
      <Container className="flex flex-col gap-stack">
        <p className="font-sans text-label-md uppercase text-secondary">
          Phase 0 — Foundation
        </p>

        <h1 className="max-w-3xl font-display text-display-lg-mobile text-on-surface md:text-display-lg">
          Ancestral wisdom, modern leadership.
        </h1>

        <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant">
          This is the foundation layer for rickireign.com — design tokens,
          typography, layout primitives, and base components. A calm, premium
          surface built for breath, presence, and somatic rhythm.
        </p>

        <div className="mt-stack flex flex-wrap items-center gap-6">
          <Button variant="primary" href="#connect">
            Book a Discovery Call
          </Button>
          <Button variant="secondary" href="#about">
            Meet Reign
          </Button>
          <Button variant="tertiary" href="#founded">
            Explore her work
          </Button>
        </div>
      </Container>
    </Section>
  );
}
