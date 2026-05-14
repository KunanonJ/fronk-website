import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
const parseBodyMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}));

vi.mock("next-sanity/webhook", () => ({
  parseBody: (...args: unknown[]) => parseBodyMock(...args),
}));

const SECRET = "test-secret";

async function callRoute(body: unknown, signature?: string) {
  const { POST } = await import("./route");
  const req = new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: signature
      ? { "content-type": "application/json", "sanity-webhook-signature": signature }
      : { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.resetModules();
    revalidateTagMock.mockReset();
    parseBodyMock.mockReset();
    process.env.SANITY_REVALIDATE_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.SANITY_REVALIDATE_SECRET;
  });

  it("rejects requests with an invalid signature (401)", async () => {
    parseBodyMock.mockResolvedValueOnce({
      isValidSignature: false,
      body: null,
    });

    const res = await callRoute({ _type: "post" }, "bad");
    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("rejects requests when the body cannot be parsed (400)", async () => {
    parseBodyMock.mockResolvedValueOnce({
      isValidSignature: true,
      body: null,
    });

    const res = await callRoute({}, "ok");
    expect(res.status).toBe(400);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("revalidates the posts tag for valid signed payloads", async () => {
    parseBodyMock.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _type: "post", slug: { current: "hello" } },
    });

    const res = await callRoute({ _type: "post", slug: { current: "hello" } }, "ok");
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("posts", "max");
  });

  it("returns 500 when the secret env var is missing", async () => {
    delete process.env.SANITY_REVALIDATE_SECRET;
    const res = await callRoute({ _type: "post" }, "ok");
    expect(res.status).toBe(500);
  });
});
