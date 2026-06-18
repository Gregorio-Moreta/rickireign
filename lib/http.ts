/** Best-effort client IP for Turnstile's optional `remoteip` (CF first). */
export function clientIp(request: Request): string | null {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

/**
 * Public origin of the request. Behind the Cloudflare/Vercel proxy `request.url`
 * can carry an internal host, so prefer the forwarded headers and fall back to
 * the request URL. Used for the Brevo DOI redirect so confirmed subscribers land
 * on the real site.
 */
export function publicOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}
