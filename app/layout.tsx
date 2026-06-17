import type { Metadata } from "next";
import { caslon, hanken } from "@/lib/fonts";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/analytics/Analytics";
import { cn } from "@/lib/cn";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ricki Reign — Founder, Facilitator & Organizational Leader",
    template: "%s — Ricki Reign",
  },
  description:
    "Ricki Reign bridges ancestral wisdom with modern leadership through somatic and organizational work. Follow her, and find the way to work together.",
  metadataBase: new URL("https://rickireign.com"),
  openGraph: {
    title: "Ricki Reign — Founder, Facilitator & Organizational Leader",
    description:
      "Ricki Reign bridges ancestral wisdom with modern leadership through somatic and organizational work.",
    url: "https://rickireign.com",
    siteName: "Ricki Reign",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(caslon.variable, hanken.variable, "h-full")}
    >
      <body className="flex min-h-full flex-col">
        {/* Skip link — first focusable element for keyboard users. */}
        <a
          href="#main-content"
          className={cn(
            "sr-only focus:not-sr-only",
            "focus:absolute focus:left-4 focus:top-4 focus:layer-skip-link",
            "focus:rounded focus:bg-primary-container focus:px-4 focus:py-2",
            "focus:font-sans focus:text-label-md focus:uppercase focus:text-on-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-surface",
          )}
        >
          Skip to content
        </a>

        <span id="top" aria-hidden="true" />
        <Nav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
