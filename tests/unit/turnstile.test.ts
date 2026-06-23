import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  fetchMock.mockReset();
});

describe("verifyTurnstile", () => {
  it("returns true when siteverify reports success", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) });
    await expect(verifyTurnstile("token", "1.2.3.4")).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("test-secret");
    expect(body.get("response")).toBe("token");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("returns false when siteverify rejects", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ success: false, "error-codes": ["invalid-input"] }),
    });
    await expect(verifyTurnstile("bad")).resolves.toBe(false);
  });

  it("fails closed when the secret is missing", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    await expect(verifyTurnstile("token")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on a network error", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    await expect(verifyTurnstile("token")).resolves.toBe(false);
  });
});
