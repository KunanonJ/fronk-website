import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The server reads Sanity's live API, not its CDN (worker-cache-followup
 * plan, decision 1). The CDN serves a stale answer while it refreshes, so a
 * render just after a webhook purge could read the old content, and the
 * edge would then keep that render for up to an hour. sanity/env.ts reads
 * the project and dataset when it loads, so each test sets them first and
 * loads the client afresh.
 */

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123xy");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
});

afterEach(() => vi.unstubAllEnvs());

describe("the server's Sanity client", () => {
  // NODE_ENV is production because the old client read the CDN only then.
  it("reads the live API, not the API CDN, whatever NODE_ENV says", async () => {
    const { buildClient } = await import("./client");
    const client = buildClient();
    expect(client).not.toBeNull();
    expect(client?.config().useCdn).toBe(false);
    expect(client?.config().perspective).toBe("published");
  });
});
