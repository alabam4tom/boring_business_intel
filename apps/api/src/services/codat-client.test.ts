import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QBO_PLATFORM_KEY, XERO_PLATFORM_KEY } from "./codat-client.js";

describe("platform keys", () => {
  it("QBO_PLATFORM_KEY is qhyg", () => {
    expect(QBO_PLATFORM_KEY).toBe("qhyg");
  });

  it("XERO_PLATFORM_KEY is gror", () => {
    expect(XERO_PLATFORM_KEY).toBe("gror");
  });
});

describe("codat-client", () => {
  beforeEach(() => {
    vi.stubEnv("CODAT_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("createCodatCompany", () => {
    it("returns company id on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "company-123" }),
      } as unknown as Response);

      const { createCodatCompany } = await import("./codat-client.js");
      const id = await createCodatCompany("Test Agency");
      expect(id).toBe("company-123");

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      const [url, options] = call;
      expect(url).toContain("/companies");
      const authHeader = (options.headers as Record<string, string>)["Authorization"];
      expect(authHeader).toContain("Basic");
    });

    it("throws AppError on Codat API failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as unknown as Response);

      const { createCodatCompany } = await import("./codat-client.js");
      await expect(createCodatCompany("Test Agency")).rejects.toMatchObject({
        code: "CODAT_ERROR",
        statusCode: 502,
      });
    });

    it("throws when CODAT_API_KEY is missing", async () => {
      vi.unstubAllEnvs();
      vi.stubEnv("CODAT_API_KEY", "");

      const { createCodatCompany } = await import("./codat-client.js");
      await expect(createCodatCompany("Test Agency")).rejects.toMatchObject({
        code: "CODAT_NOT_CONFIGURED",
        statusCode: 503,
      });
    });
  });

  describe("createCodatConnection", () => {
    it("returns connectionId and linkUrl on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "conn-456", linkUrl: "https://link.codat.io/abc" }),
      } as unknown as Response);

      const { createCodatConnection } = await import("./codat-client.js");
      const result = await createCodatConnection("company-123");
      expect(result.connectionId).toBe("conn-456");
      expect(result.linkUrl).toBe("https://link.codat.io/abc");

      const firstCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect(firstCall[0]).toContain("company-123/connections");
    });

    it("uses qhyg platform key by default", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "conn-789", linkUrl: "https://link.codat.io/xyz" }),
      } as unknown as Response);

      const { createCodatConnection } = await import("./codat-client.js");
      await createCodatConnection("company-123");

      const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);
      expect(body.platformKey).toBe("qhyg");
    });
  });
});
