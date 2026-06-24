import { Fragment } from "react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import type { GuidingQuestion } from "@/lib/sanity/types";

/**
 * Section 2 — Guiding Questions. Large Caslon-italic reflective prompts,
 * centered, separated by the triple-asterisk motif (DESIGN.md §Shapes). Italics
 * are used sparingly and deliberately here per the type guidance.
 */
export function GuidingQuestions({
  questions,
}: {
  questions: GuidingQuestion[] | undefined;
}) {
  const items = (questions ?? []).filter((q) => q.question);
  if (items.length === 0) return null;

  return (
    <Section aria-label="Guiding questions" tone="alt">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {items.map((item, i) => (
            <Fragment key={item._key}>
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className="my-10 select-none font-display text-2xl tracking-[0.5em] text-outline"
                >
                  * * *
                </span>
              ) : null}
              <blockquote className="font-display italic text-quote text-on-surface md:text-headline-md text-balance">
                {item.question}
              </blockquote>
              {item.note ? (
                <p className="mt-4 font-sans text-body-md text-on-surface-variant">
                  {item.note}
                </p>
              ) : null}
            </Fragment>
          ))}
        </div>
      </Container>
    </Section>
  );
}
