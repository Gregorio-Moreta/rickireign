import { cn } from "@/lib/cn";

/**
 * On-brand placeholder cover for posts with no image, so the Journal grid stays
 * uniform (every card has a 3:2 cover). A calm forest→teal gradient with a
 * subtle dotted "ancestral grid" texture and the wordmark — reads as an
 * intentional branded cover rather than a missing image.
 */
export function CoverFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-primary-container via-deep-teal to-earth-charcoal",
        className,
      )}
    >
      {/* Dotted ancestral-grid texture. */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          color: "var(--color-sand-stone)",
        }}
      />
      <div className="relative flex flex-col items-center gap-1 px-6 text-center">
        <span className="font-sans text-label-md uppercase text-luminous-teal">
          Journal
        </span>
        <span className="font-display text-2xl text-on-primary/90">
          Ricki Reign
        </span>
      </div>
    </div>
  );
}
