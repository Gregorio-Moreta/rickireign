import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import type { SimpleSection } from "@/lib/sanity/types";

/**
 * Section 7 — Join the list. Presentational shell only: the input + button show
 * the intended UI, but the control is disabled and carries no submit logic. The
 * Brevo double-opt-in flow + Turnstile are wired in Phase 3 (Forms & legal);
 * that work removes `disabled` and attaches the action — the markup stays.
 */
export function Newsletter({ data }: { data: SimpleSection | undefined }) {
  if (!data) return null;

  return (
    <Section
      id="newsletter"
      aria-label={data.title ?? "Join the list"}
      className="bg-surface-container-low"
    >
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          {data.title ? (
            <h2 className="font-display text-headline-lg-mobile text-on-surface md:text-headline-lg text-balance">
              {data.title}
            </h2>
          ) : null}
          {data.body ? (
            <p className="max-w-xl font-sans text-body-lg text-on-surface-variant text-pretty">
              {data.body}
            </p>
          ) : null}

          <form
            aria-label="Newsletter sign-up"
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled
              className="min-h-11 flex-1 border-b-2 border-earth-charcoal/10 bg-transparent px-1 py-3 font-sans text-body-md text-on-surface placeholder:text-outline focus:border-luminous-teal focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded bg-primary-container px-6 py-3 font-sans text-label-md uppercase text-on-primary opacity-50"
            >
              Subscribe
            </button>
          </form>
          <p className="font-sans text-body-md text-on-surface-variant">
            Sign-ups open soon.
          </p>
        </div>
      </Container>
    </Section>
  );
}
