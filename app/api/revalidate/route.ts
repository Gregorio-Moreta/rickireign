import { revalidatePath } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

/**
 * Sanity publish webhook → on-demand revalidation. When an editor publishes in
 * the Studio, Sanity POSTs here; we verify the HMAC signature, then revalidate
 * the whole site (the root layout cascades to every route) so edits go live
 * within seconds instead of waiting on the 60s ISR window.
 *
 * Register in sanity.io/manage → API → Webhooks:
 *   URL:     https://<site>/api/revalidate
 *   Trigger: Create / Update / Delete
 *   Secret:  same value as SANITY_REVALIDATE_SECRET (server env, both deploys)
 *
 * nodejs runtime: signature verification uses Node crypto.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    // Fail closed: without a configured secret we cannot trust any caller.
    return Response.json(
      { error: "Revalidation webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  // Root layout cascades to all routes — refresh the whole (small) site.
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true, now: Date.now() });
}
