import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("GET /api/draft/disable", () => {
  beforeEach(() => {
    vi.resetModules();
    enableMock.mockReset();
    disableMock.mockReset();
  });

  it("disables draft mode and redirects to a safe internal path", async () => {
    const { GET } = await import("./route");

    const res = await GET(
      request("/api/draft/disable?slug=/writing/welcome"),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/writing/welcome");
    expect(disableMock).toHaveBeenCalledOnce();
  });

  it("falls back to the home page for unsafe redirect paths", async () => {
    const { GET } = await import("./route");

    const res = await GET(
      request("/api/draft/disable?slug=https://evil.example"),
    );

    expect(res.headers.get("location")).toBe("http://localhost/");
  });
});
