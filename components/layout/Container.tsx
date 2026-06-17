import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Render element. Defaults to a neutral <div>. */
  as?:
    | "div"
    | "header"
    | "footer"
    | "nav"
    | "section"
    | "main"
    | "article"
    | "aside"
    | "ul"
    | "ol";
}

/**
 * Centered content column (DESIGN.md §Layout): max 1200px with responsive
 * horizontal margins — 20px mobile / 40px tablet / 60px desktop.
 */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-(--container-max)",
        "px-margin-mobile md:px-margin-tablet lg:px-margin-desktop",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
