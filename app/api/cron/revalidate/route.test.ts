import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}));

describe("GET /api/cron/revalidate", () => {
  beforeEach(() => {
    vi.resetModules();
    revalidateTagMock.mockReset();
    process.env.CRON_SECRET = "cron-secret";
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects unauthorized requests", async () => {
    const { GET } = await import("./route");
    const res = await GET(new Request("http://localhost/api/cron/revalidate"));
    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("revalidates scheduled content tags with a valid bearer token", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost/api/cron/revalidate", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );

    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("posts", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("writing", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("pages", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("ventures", "max");

    const payload = await res.json();
    expect(payload.tags).toEqual(["posts", "writing", "pages", "ventures"]);
  });
});
