import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { SocialLink, SocialPlatform } from "@/lib/sanity/types";

/**
 * Renders Sanity `siteSettings.social` as accessible icon links. Shared by the
 * Footer (inverse surface) and the Connect section (light surface), so the link
 * styling is passed in. Unknown platforms are skipped rather than rendered
 * without an icon.
 */

interface SocialLinksProps {
  links: SocialLink[] | undefined;
  /** Tailwind classes for each anchor (color + focus ring per surface). */
  linkClassName: string;
  className?: string;
}

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  patreon: "Patreon",
  email: "Email",
};

const PLATFORM_ICON: Record<SocialPlatform, () => ReactNode> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  patreon: PatreonIcon,
  email: EmailIcon,
};

export function SocialLinks({
  links,
  linkClassName,
  className,
}: SocialLinksProps) {
  const valid = (links ?? []).filter(
    (l) => l.url && l.platform in PLATFORM_ICON,
  );
  if (valid.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {valid.map((link) => {
        const Icon = PLATFORM_ICON[link.platform];
        const isMail = link.platform === "email";
        return (
          <li key={link._key}>
            <a
              href={isMail ? `mailto:${link.url}` : link.url}
              {...(isMail
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              aria-label={PLATFORM_LABEL[link.platform]}
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-full",
                "transition-colors duration-200",
                "motion-reduce:transition-none",
                linkClassName,
              )}
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

function InstagramIcon() {
  return (
    <IconWrap>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52.01-4.76.07-.9.04-1.39.2-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.32-.28.81-.32 1.71C3.21 8.48 3.2 8.85 3.2 12s0 3.52.06 4.76c.04.9.2 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.12.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52 0 4.76-.07c.9-.04 1.39-.2 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s0-3.52-.07-4.76c-.04-.9-.2-1.39-.32-1.71a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.12-.81-.28-1.71-.32C15.52 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 7.06 12 4.94 4.94 0 0 1 12 7.06Zm0 1.8A3.14 3.14 0 1 0 15.14 12 3.14 3.14 0 0 0 12 8.86Zm5.14-2.96a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z" />
    </IconWrap>
  );
}

function YouTubeIcon() {
  return (
    <IconWrap>
      <path d="M23.5 6.5a3 3 0 0 0-2.11-2.13C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.39.51A3 3 0 0 0 .5 6.5 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.5 3 3 0 0 0 2.11 2.13c1.89.51 9.39.51 9.39.51s7.5 0 9.39-.51A3 3 0 0 0 23.5 17.5 31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.2 3.6Z" />
    </IconWrap>
  );
}

function PatreonIcon() {
  return (
    <IconWrap>
      <path d="M14.82 2.41c-4.4 0-7.98 3.58-7.98 7.98 0 4.39 3.58 7.96 7.98 7.96 4.38 0 7.95-3.57 7.95-7.96 0-4.4-3.57-7.98-7.95-7.98ZM1.5 21.59h3.9V2.41H1.5z" />
    </IconWrap>
  );
}

function EmailIcon() {
  return (
    <IconWrap>
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.1 8-5.1H4l8 5.1ZM4 8.2V18h16V8.2l-8 5.1-8-5.1Z" />
    </IconWrap>
  );
}
