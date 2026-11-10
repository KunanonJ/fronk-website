import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./githubContributions";

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/github/contributions", () => {
  it("answers 503 with no-store when GitHub cannot be reached, so nothing caches it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 502 })),
    );
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    // The empty calendar the card falls back to anyway.
    const body = (await res.json()) as { weeks: unknown[] };
    expect(Array.isArray(body.weeks)).toBe(true);
  });

  it("answers 503 when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await GET()).status).toBe(503);
  });
});
