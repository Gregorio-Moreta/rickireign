"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root error boundary. Replaces the whole document when an error escapes the
 * root layout, so it must render its own <html>/<body>. Reports to Sentry
 * (no-op without a DSN) and shows a calm, on-brand fallback.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#fbf9f6",
          color: "#1b1c1a",
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Something went wrong.</h1>
        <p style={{ fontFamily: "ui-sans-serif, system-ui", margin: 0 }}>
          Please refresh the page, or head back{" "}
          {/* A hard navigation (not next/link) is intentional here: the root
              error boundary runs when the app shell is broken, so a full reload
              is the most reliable recovery. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: "#00677d", textDecoration: "underline" }}>
            home
          </a>
          .
        </p>
      </body>
    </html>
  );
}
