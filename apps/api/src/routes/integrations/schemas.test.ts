import { describe, it, expect } from "vitest";
import { connectQuickBooksSchema, connectXeroSchema } from "./schemas.js";

describe("connectQuickBooksSchema", () => {
  it("accepts consentAccepted: true", () => {
    const result = connectQuickBooksSchema.safeParse({ consentAccepted: true });
    expect(result.success).toBe(true);
  });

  it("rejects consentAccepted: false", () => {
    const result = connectQuickBooksSchema.safeParse({ consentAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing consentAccepted", () => {
    const result = connectQuickBooksSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean consentAccepted", () => {
    const result = connectQuickBooksSchema.safeParse({ consentAccepted: "yes" });
    expect(result.success).toBe(false);
  });
});

describe("connectXeroSchema", () => {
  it("accepts consentAccepted: true", () => {
    const result = connectXeroSchema.safeParse({ consentAccepted: true });
    expect(result.success).toBe(true);
  });

  it("rejects consentAccepted: false", () => {
    const result = connectXeroSchema.safeParse({ consentAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing consentAccepted", () => {
    const result = connectXeroSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean consentAccepted", () => {
    const result = connectXeroSchema.safeParse({ consentAccepted: "yes" });
    expect(result.success).toBe(false);
  });
});
