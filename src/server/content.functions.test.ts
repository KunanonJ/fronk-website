import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * getResumeProfile's own response (recruiter-fit phase 3). On a client-side
 * navigation the browser fetches this function over HTTP, and the Worker
 * cache keeps a 200 that carries no Cache-Control for two hours (Cloudflare's
 * default once `cache.enabled` is set). The Worker entry marks such answers
 * no-store (src/server.ts); a stand-in for a failed Sanity read must not be
 * kept even without that rule, so the function marks its response no-store
 * itself. The route's `headers` cover the page.
 *
 * A server function runs only inside the Start runtime. Here createServerFn
 * is replaced by a builder that hands the handler back, so the handler's own
 * statements run, and the response helper is a spy.
 */

const setResponseHeaders = vi.hoisted(() => vi.fn());
const fetchResumeProfile = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-start", () => {
  const builder = {
    validator: () => builder,
    handler: (fn: unknown) => fn,
  };
  return { createServerFn: () => builder };
});
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeaders }));
vi.mock("@/lib/sanity/fetch", () => ({
  fetchResumeProfile,
  fetchAllPosts: vi.fn(),
  fetchPostBySlug: vi.fn(),
  fetchWritingPage: vi.fn(),
}));

const { getResumeProfile } = await import("./content.functions");

beforeEach(() => {
  setResponseHeaders.mockReset();
  fetchResumeProfile.mockReset();
});
afterEach(() => vi.restoreAllMocks());

describe("getResumeProfile", () => {
  it("answers a failed Sanity read with the repo's résumé, marked no-store", async () => {
    fetchResumeProfile.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const profile = await getResumeProfile();
    expect(profile.degraded).toBe(true);
    expect(profile.sections.length).toBeGreaterThan(0);
    // no-store, and nothing else: no tag and no edge lifetime for a stand-in.
    expect(setResponseHeaders).toHaveBeenCalledTimes(1);
    const [headers] = setResponseHeaders.mock.calls[0] as [Headers];
    expect([...headers]).toEqual([["cache-control", "no-store"]]);
  });

  it("leaves the headers of a good read alone", async () => {
    // The page's cache headers come from the route. Edge headers set here
    // would also land on the page, error page included.
    fetchResumeProfile.mockResolvedValue(null);
    const profile = await getResumeProfile();
    expect(profile.degraded).toBe(false);
    expect(setResponseHeaders).not.toHaveBeenCalled();
  });
});
