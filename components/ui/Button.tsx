import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary";

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared base: focus-visible ring, pointer cursor, reduced-motion-safe
 * transitions, and a disabled affordance. (DESIGN.md §Buttons +
 * UI/UX Pro Max pre-delivery checklist.)
 */
const base = cn(
  "inline-flex items-center justify-center gap-2",
  "font-sans text-label-md uppercase",
  "rounded transition-[background-color,color,box-shadow,transform] duration-200 ease-out",
  "cursor-pointer select-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "focus-visible:ring-primary-container focus-visible:ring-offset-surface",
  "disabled:pointer-events-none disabled:opacity-50",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
);

const variants: Record<Variant, string> = {
  // Solid Forest Green, white text (~11:1 contrast), subtle lift on hover.
  primary: cn(
    "bg-primary-container text-on-primary px-6 py-3",
    "shadow-sm hover:-translate-y-0.5 hover:shadow-md",
    "active:translate-y-0",
  ),
  // Outlined Forest Green; subtle fill on hover.
  secondary: cn(
    "border border-primary-container bg-transparent text-primary-container px-6 py-3",
    "hover:bg-primary-container/8",
  ),
  // Teal text label (uses AA-safe --color-secondary for the small text) + chevron.
  // Luminous teal is reserved for the icon / hover only (non-text, 3:1 applies).
  tertiary: cn(
    "bg-transparent px-1 py-1 text-secondary normal-case tracking-normal",
    "hover:text-luminous-teal",
    "[&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5",
    "motion-reduce:hover:[&_svg]:translate-x-0",
  ),
};

function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 3 5 5-5 5" />
    </svg>
  );
}

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {variant === "tertiary" ? <ChevronRight /> : null}
    </>
  );

  if (rest.href !== undefined) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    // Harden new-tab links: default to noopener/noreferrer unless caller overrides.
    const rel =
      anchorRest.target === "_blank"
        ? anchorRest.rel ?? "noopener noreferrer"
        : anchorRest.rel;
    return (
      <a className={classes} {...anchorRest} rel={rel}>
        {content}
      </a>
    );
  }

  const { type, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type ?? "button"} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
