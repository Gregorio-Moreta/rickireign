import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDoiContact, sendContactEmail } from "@/lib/brevo";

/** Build a minimal Response-like stub for the mocked fetch. */
function fetchResult(opts: { ok: boolean; status: number; text?: string }) {
  return {
    ok: opts.ok,
    status: opts.status,
    text: async () => opts.text ?? "",
  } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("BREVO_API_KEY", "test-key");
  vi.stubEnv("BREVO_LIST_ID", "3");
  vi.stubEnv("BREVO_DOI_TEMPLATE_ID", "1");
  vi.stubEnv("BREVO_SENDER_EMAIL", "sender@rickireign.com");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  fetchMock.mockReset();
});

describe("createDoiContact", () => {
  it("POSTs the DOI confirmation with list, template, and redirect", async () => {
    fetchMock.mockResolvedValue(fetchResult({ ok: true, status: 201 }));

    const result = await createDoiContact(
      "person@example.com",
      "https://rickireign.com/?subscribed=1",
    );

    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/contacts/doubleOptinConfirmation");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("test-key");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      email: "person@example.com",
      includeListIds: [3],
      templateId: 1,
      redirectionUrl: "https://rickireign.com/?subscribed=1",
    });
  });

  it("treats a 'contact already exists' 400 as benign success", async () => {
    fetchMock.mockResolvedValue(
      fetchResult({ ok: false, status: 400, text: "Contact already exists" }),
    );
    const result = await createDoiContact("dup@example.com", "https://x/");
    expect(result.ok).toBe(true);
  });

  it("reports a genuine error (e.g. 500) as not ok", async () => {
    fetchMock.mockResolvedValue(
      fetchResult({ ok: false, status: 500, text: "Internal error" }),
    );
    const result = await createDoiContact("a@example.com", "https://x/");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });

  it("throws when list/template ids are not configured", async () => {
    vi.stubEnv("BREVO_LIST_ID", "");
    await expect(
      createDoiContact("a@example.com", "https://x/"),
    ).rejects.toThrow();
  });
});

describe("sendContactEmail", () => {
  it("POSTs a transactional email with reply-to and HTML-escaped content", async () => {
    fetchMock.mockResolvedValue(fetchResult({ ok: true, status: 201 }));

    const result = await sendContactEmail({
      fromName: "Ada",
      fromEmail: "ada@example.com",
      message: "Hi <script>alert(1)</script> & friends",
      to: "welcome@rickireign.com",
    });

    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    const body = JSON.parse(init.body as string);
    expect(body.replyTo).toEqual({ email: "ada@example.com", name: "Ada" });
    expect(body.to).toEqual([{ email: "welcome@rickireign.com" }]);
    // The message is escaped in the HTML part — no raw <script> tag.
    expect(body.htmlContent).not.toContain("<script>");
    expect(body.htmlContent).toContain("&lt;script&gt;");
    expect(body.htmlContent).toContain("&amp;");
  });

  it("reports a Brevo error as not ok", async () => {
    fetchMock.mockResolvedValue(
      fetchResult({ ok: false, status: 502, text: "bad gateway" }),
    );
    const result = await sendContactEmail({
      fromName: "Ada",
      fromEmail: "ada@example.com",
      message: "Hi",
      to: "welcome@rickireign.com",
    });
    expect(result.ok).toBe(false);
  });
});
