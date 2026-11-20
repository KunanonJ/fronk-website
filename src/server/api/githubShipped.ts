import { SITE_REPO, parseLatestCommit } from "@/lib/github/shipped";

/*
 * GET /api/github/shipped (now-building-and-genz Phase 5): the latest commit
 * on the site's main branch, for the footer's ship log. GitHub's REST API
 * with GITHUB_TOKEN when the Worker has it (5,000 requests an hour) and
 * without it otherwise (60); the token only ever goes to api.github.com in
 * the Authorization header. The answer carries the subject, the date and
 * the commit's link, nothing else from GitHub.
 *
 * Kept ten minutes at the edge and in browsers, so the Worker asks GitHub
 * at most every ten minutes per location. When GitHub fails, the answer is
 * a 503 with no-store that nothing keeps: the edge serves its last copy for
 * up to a day (stale-if-error), and with no copy the footer shows nothing.
 */

const COMMITS_URL = `https://api.github.com/repos/${SITE_REPO.owner}/${SITE_REPO.name}/commits?sha=${SITE_REPO.branch}&per_page=1`;

/** GitHub can be slow; the footer would rather show nothing. */
const TIMEOUT_MS = 5000;

/** Ten minutes in browsers; Cache-Control is always set, never left out. */
export const SHIPPED_BROWSER_CACHE = "public, max-age=600";

/**
 * Ten minutes at the edge (read before Cache-Control), and a day of the last
 * copy when the Worker fails while it refreshes (src/lib/cache.ts).
 */
export const SHIPPED_EDGE_CACHE = "public, max-age=600, stale-if-error=86400";

function unavailable(): Response {
  return Response.json(null, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(): Promise<Response> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(COMMITS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "kunanonj-website-activity",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return unavailable();
    const shipped = parseLatestCommit(await res.json());
    if (!shipped) return unavailable();
    return Response.json(shipped, {
      headers: {
        "Cache-Control": SHIPPED_BROWSER_CACHE,
        "CDN-Cache-Control": SHIPPED_EDGE_CACHE,
      },
    });
  } catch {
    return unavailable();
  }
}
