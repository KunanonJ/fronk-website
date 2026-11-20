import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GET,
  SHIPPED_BROWSER_CACHE,
  SHIPPED_EDGE_CACHE,
} from "./githubShipped";

/*
 * GET /api/github/shipped (now-building-and-genz Phase 5): GitHub's latest
 * commit on main as { subject, date, url }, kept ten minutes, or a 503 that
 * nothing keeps. The token only ever goes to GitHub.
 */

const SHA = "0123456789abcdef0123456789abcdef01234567";
const TOKEN = "ghp_test-token-never-shown";

const COMMITS = [
  {
    sha: SHA,
    html_url: `https://github.com/KunanonJ/fronk-website/commit/${SHA}`,
    commit: {
      message:
        "feat(resume): Snapshot, a recruiter-first résumé with a facts card (#159)\n\nBody text",
      committer: { date: "2026-11-20T08:12:33Z" },
    },
  },
];

function stubFetch(response: Response | Promise<Response>) {
  const fetchMock = vi.fn().mockReturnValue(Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/github/shipped", () => {
  it("answers the subject, the date and the commit's link, kept ten minutes", async () => {
    stubFetch(Response.json(COMMITS));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      subject:
        "feat(resume): Snapshot, a recruiter-first résumé with a facts card (#159)",
      date: "2026-11-20T08:12:33.000Z",
      url: `https://github.com/KunanonJ/fronk-website/commit/${SHA}`,
    });
    expect(res.headers.get("cache-control")).toBe(SHIPPED_BROWSER_CACHE);
    expect(res.headers.get("cache-control")).toBe("public, max-age=600");
    expect(res.headers.get("cdn-cache-control")).toBe(SHIPPED_EDGE_CACHE);
    expect(SHIPPED_EDGE_CACHE).toMatch(/max-age=600/);
    expect(SHIPPED_EDGE_CACHE).toMatch(/stale-if-error=\d+/);
  });

  it("asks for main's latest commit of the site's repository, with the token when there is one", async () => {
    vi.stubEnv("GITHUB_TOKEN", TOKEN);
    const fetchMock = stubFetch(Response.json(COMMITS));
    const res = await GET();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.github.com/repos/KunanonJ/fronk-website/commits?sha=main&per_page=1",
    );
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe(`Bearer ${TOKEN}`);
    expect(headers.get("user-agent")).toBeTruthy();
    expect(init.signal).toBeInstanceOf(AbortSignal);
    // The token goes to GitHub and nowhere else.
    expect(await res.text()).not.toContain(TOKEN);
    expect([...res.headers.values()].join(" ")).not.toContain(TOKEN);
  });

  it("asks without a token when the Worker has none", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const fetchMock = stubFetch(Response.json(COMMITS));
    expect((await GET()).status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).has("authorization")).toBe(false);
  });

  it("answers 503 with no-store when GitHub refuses (rate limit, outage), so nothing keeps it", async () => {
    vi.stubEnv("GITHUB_TOKEN", TOKEN);
    stubFetch(
      Response.json(
        { message: `Bad credentials for ${TOKEN}` },
        { status: 401 },
      ),
    );
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.has("cdn-cache-control")).toBe(false);
    expect(await res.text()).not.toContain(TOKEN);
  });

  it("answers 503 when GitHub's answer is not a commit", async () => {
    stubFetch(Response.json({ message: "Not Found" }));
    expect((await GET()).status).toBe(503);
    stubFetch(new Response("<html>oops</html>", { status: 200 }));
    expect((await GET()).status).toBe(503);
  });

  it("answers 503 when the request throws or times out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await GET()).status).toBe(503);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
    );
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
