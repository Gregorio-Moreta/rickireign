import { describe, it, expect } from "vitest";
import {
  newsletterSchema,
  contactSchema,
  isHoneypotFilled,
  HONEYPOT_FIELD,
} from "@/lib/validation";

const TOKEN = "turnstile-token";

describe("newsletterSchema", () => {
  it("accepts a valid email + token and normalises the email", () => {
    const parsed = newsletterSchema.parse({
      email: "  Person@Example.COM ",
      turnstileToken: TOKEN,
    });
    expect(parsed.email).toBe("person@example.com");
    expect(parsed.turnstileToken).toBe(TOKEN);
  });

  it("rejects a malformed email", () => {
    const result = newsletterSchema.safeParse({
      email: "not-an-email",
      turnstileToken: TOKEN,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an over-long email (max 254)", () => {
    const long = `${"a".repeat(250)}@example.com`;
    const result = newsletterSchema.safeParse({
      email: long,
      turnstileToken: TOKEN,
    });
    expect(result.success).toBe(false);
  });

  it("requires a non-empty turnstile token", () => {
    const result = newsletterSchema.safeParse({
      email: "person@example.com",
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  const base = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there.",
    turnstileToken: TOKEN,
  };

  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects CR/LF in the name (header-injection guard)", () => {
    expect(
      contactSchema.safeParse({ ...base, name: "Ada\r\nBcc: x@y.com" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...base, name: "Ada\nEvil" }).success,
    ).toBe(false);
  });

  it("requires a non-empty name and message", () => {
    expect(contactSchema.safeParse({ ...base, name: "   " }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, message: "" }).success).toBe(false);
  });

  it("rejects an over-long message (max 5000)", () => {
    expect(
      contactSchema.safeParse({ ...base, message: "x".repeat(5001) }).success,
    ).toBe(false);
  });
});

describe("isHoneypotFilled", () => {
  it("is true when the honeypot field has a non-empty value", () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "bot" })).toBe(true);
  });

  it("is false when empty, whitespace, missing, or not an object", () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "" })).toBe(false);
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "   " })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled(null)).toBe(false);
    expect(isHoneypotFilled("nope")).toBe(false);
  });
});
