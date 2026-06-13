import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const enableMock = vi.fn();
const disableMock = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({
    enable: enableMock,
    disable: disableMock,
  })),
}));

function request(path: string) {
  return new Request(`http://localhost${path}`);
}

describe("GET /api/draft", () => {
  beforeEach(() => {
    vi.resetModules();
    enableMock.mockReset();
    disableMock.mockReset();
    process.env.SANITY_PREVIEW_SECRET = "preview-secret";
  });

  afterEach(() => {
    delete process.env.SANITY_PREVIEW_SECRET;
  });

  it("rejects missing or invalid preview secrets", async () => {
    const { GET } = await import("./route");

    const res = await GET(request("/api/draft?secret=bad&slug=/writing"));

    expect(res.status).toBe(401);
    expect(enableMock).not.toHaveBeenCalled();
  });

  it("enables draft mode and redirects to a safe internal path", async () => {
    const { GET } = await import("./route");

    const res = await GET(
      request("/api/draft?secret=preview-secret&slug=/writing/welcome"),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/writing/welcome");
    expect(enableMock).toHaveBeenCalledOnce();
  });

  it("falls back to the home page for unsafe redirect paths", async () => {
    const { GET } = await import("./route");

    const res = await GET(
      request("/api/draft?secret=preview-secret&slug=https://evil.example"),
    );

    expect(res.headers.get("location")).toBe("http://localhost/");
  });
});
