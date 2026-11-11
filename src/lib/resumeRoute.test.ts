import { readFileSync } from "node:fs";
import {
  QueryObserver,
  focusManager,
  type QueryClient,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/src/lib/queryClient";

/*
 * The /resume route itself (recruiter-fit phase 3): what it asks the edge to
 * keep, and what its loader reuses. The helpers have their own tests; these
 * go through the route's options, so rewiring the route fails here. The
 * QueryClient is the app's own (src/lib/queryClient.ts). The router is not
 * run: a mounted page is modelled by a QueryObserver, which is what
 * useSuspenseQuery subscribes.
 */

const getResumeProfile = vi.hoisted(() => vi.fn());
vi.mock("@/src/server/content.functions", () => ({
  getResumeProfile,
  getBlogIndex: vi.fn(),
  getBlogPost: vi.fn(),
  getLearnCards: vi.fn(),
}));

const { Route } = await import("@/src/routes/_landing/resume");
const { resumeQuery } = await import("@/src/queries/content");

type Profile = { name: string; degraded: boolean };
const fromSanity: Profile = { name: "From Sanity", degraded: false };
const standIn: Profile = { name: "From the repo", degraded: true };

const options = Route.options as unknown as {
  headers: (ctx: {
    match: { status: string };
    loaderData?: Profile;
  }) => Record<string, string>;
  loader: (ctx: { context: { queryClient: QueryClient } }) => Promise<Profile>;
};

/**
 * A client that already holds `profile`, as after a server render, read
 * `ageMs` ago. It is mounted, as the app's provider mounts it, so it hears
 * the window regain focus.
 */
function clientHolding(profile: Profile, ageMs = 0): QueryClient {
  const queryClient = createQueryClient();
  queryClient.mount();
  mounted.push(queryClient);
  queryClient.setQueryData(resumeQuery.queryKey, profile as never, {
    updatedAt: Date.now() - ageMs,
  });
  return queryClient;
}

/** Clients mounted by a test, unmounted after it so they stop listening. */
const mounted: QueryClient[] = [];

/**
 * The page on screen: the observer useSuspenseQuery would subscribe, with
 * the one thing the hook adds, a stale time of at least a second (react-
 * query's ensureSuspenseTimers). src/lib/resumeHook.test.tsx checks this
 * model against the hook itself.
 */
function mountPage(queryClient: QueryClient) {
  const observer = new QueryObserver(queryClient, {
    ...resumeQuery,
    staleTime: (query) => {
      const own = resumeQuery.staleTime;
      const value = typeof own === "function" ? own(query) : own;
      return typeof value === "number" ? Math.max(value, 1000) : 1000;
    },
  });
  const unmount = observer.subscribe(() => {});
  return { shown: () => observer.getCurrentResult().data, unmount };
}

/** The window loses focus and regains it, `afterMs` later. */
function refocusAfter(afterMs: number) {
  vi.setSystemTime(Date.now() + afterMs);
  focusManager.setFocused(false);
  focusManager.setFocused(true);
}

const cached = (queryClient: QueryClient) =>
  queryClient.getQueryData(resumeQuery.queryKey);

/** Resolves once no read is in flight, a turn of the event loop later. */
async function settled(queryClient: QueryClient) {
  await new Promise((turn) => setTimeout(turn, 0));
  await vi.waitFor(() =>
    expect(queryClient.getQueryState(resumeQuery.queryKey)?.fetchStatus).toBe(
      "idle",
    ),
  );
}

beforeEach(() => {
  getResumeProfile.mockReset();
});
afterEach(() => {
  for (const queryClient of mounted.splice(0)) queryClient.unmount();
});

describe("/resume: what the edge may keep", () => {
  it("keeps a résumé read from Sanity for a day, under its tag", () => {
    const headers = options.headers({
      match: { status: "success" },
      loaderData: fromSanity,
    });
    expect(headers["Cache-Tag"]).toBe("resume");
    expect(headers["CDN-Cache-Control"]).toBe(
      "public, max-age=86400, stale-while-revalidate=86400",
    );
  });

  it("keeps nothing when the repo's résumé stood in for a failed read", () => {
    // Otherwise one failed read would pin the stand-in for every visitor.
    expect(
      options.headers({ match: { status: "success" }, loaderData: standIn }),
    ).toEqual({ "Cache-Control": "no-store" });
  });

  it("keeps nothing for an error page, with or without loader data", () => {
    expect(options.headers({ match: { status: "error" } })).toEqual({
      "Cache-Control": "no-store",
    });
    expect(
      options.headers({ match: { status: "error" }, loaderData: fromSanity }),
    ).toEqual({ "Cache-Control": "no-store" });
  });
});

// The server function the loader calls is mocked above. Its own statements
// (the fallback, and no-store on a stand-in's response) are tested in
// src/server/content.functions.test.ts.

describe("/resume: the printed résumé", () => {
  it("marks a stand-in on the page, under the name the PDF script looks for", () => {
    // `pnpm pdf` refuses to print the repo's stand-in as the résumé. The
    // page and the script meet only through this attribute, and neither can
    // be run here, so both sources are read.
    const script = readFileSync("scripts/generate-resume-pdf.mjs", "utf8");
    const selector =
      /page\.locator\("\[(data-[a-z-]+)\]"\)\.count\(\)\) > 0\)\s*throw/.exec(
        script,
      )?.[1];
    expect(selector).toBe("data-resume-stand-in");
    const route = readFileSync("src/routes/_landing/resume.tsx", "utf8");
    expect(route.replace(/\s+/g, " ")).toContain(
      `${selector}={profile.degraded ? "" : undefined}`,
    );
  });
});

describe("the app's query settings", () => {
  it("never go stale, retry once in the browser and not at all on the server", () => {
    // The loader's handling of a stand-in rests on these.
    expect(createQueryClient().getDefaultOptions().queries).toEqual({
      staleTime: Number.POSITIVE_INFINITY,
      retry: 0,
    });
    vi.stubGlobal("window", {});
    expect(createQueryClient().getDefaultOptions().queries?.retry).toBe(1);
    vi.unstubAllGlobals();
  });
});

describe("/resume: what the loader reuses", () => {
  it("reads once, then reuses a good read", async () => {
    getResumeProfile.mockResolvedValue(fromSanity);
    const queryClient = createQueryClient();
    await expect(options.loader({ context: { queryClient } })).resolves.toEqual(
      fromSanity,
    );
    await options.loader({ context: { queryClient } });
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
  });

  it("returns a cached stand-in at once when no page is on screen, and asks nothing", async () => {
    const queryClient = clientHolding(standIn);
    getResumeProfile.mockReturnValue(new Promise(() => {}));
    await expect(options.loader({ context: { queryClient } })).resolves.toEqual(
      standIn,
    );
    // Nothing is on screen yet, so nothing is asked: a hovered link that
    // preloads the route costs no request.
    expect(getResumeProfile).not.toHaveBeenCalled();
    // But the stand-in is marked, so the page asks when it mounts.
    expect(queryClient.getQueryState(resumeQuery.queryKey)?.isInvalidated).toBe(
      true,
    );
  });

  it("returns a cached stand-in at once while the page is on screen and the server never answers", async () => {
    // The page must not wait: a slow Sanity takes about half a minute to
    // fail, and an offline browser never does. Here a request is in flight
    // and never settles; a loader that waited for it would lose the race.
    const queryClient = clientHolding(standIn);
    const page = mountPage(queryClient);
    getResumeProfile.mockReturnValue(new Promise(() => {}));
    const outcome = await Promise.race([
      options.loader({ context: { queryClient } }),
      new Promise((held) => setTimeout(() => held("held"), 500)),
    ]);
    expect(outcome).toEqual(standIn);
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    page.unmount();
  });

  it("asks again when the page mounts, and redraws with the answer", async () => {
    // A visitor who met an outage and comes back to the page gets the real
    // résumé once Sanity answers again.
    const queryClient = clientHolding(standIn);
    getResumeProfile.mockResolvedValue(fromSanity);
    await options.loader({ context: { queryClient } });
    const page = mountPage(queryClient);
    expect(page.shown()).toEqual(standIn);
    await vi.waitFor(() => expect(page.shown()).toEqual(fromSanity));
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    // A good read now: the next visit does not ask a second time.
    await options.loader({ context: { queryClient } });
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    expect(cached(queryClient)).toEqual(fromSanity);
    page.unmount();
  });

  it("asks straight away when the page is already on screen", async () => {
    // The loader runs again under the mounted page when the visitor follows
    // a link to the page already shown. (A ?view= change does not run it.)
    const queryClient = clientHolding(standIn);
    const page = mountPage(queryClient);
    expect(getResumeProfile).not.toHaveBeenCalled();
    getResumeProfile.mockResolvedValue(fromSanity);
    await options.loader({ context: { queryClient } });
    await vi.waitFor(() => expect(page.shown()).toEqual(fromSanity));
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    page.unmount();
  });

  it("keeps asking on each visit while the answer is still a stand-in", async () => {
    const queryClient = clientHolding(standIn);
    getResumeProfile.mockResolvedValue(standIn);
    const page = mountPage(queryClient);
    await options.loader({ context: { queryClient } });
    await vi.waitFor(() => expect(getResumeProfile).toHaveBeenCalledTimes(1));
    await settled(queryClient);
    await options.loader({ context: { queryClient } });
    await vi.waitFor(() => expect(getResumeProfile).toHaveBeenCalledTimes(2));
    page.unmount();
  });

  it("keeps the stand-in on screen when the second read fails", async () => {
    // The page is already drawn; a failed second try must not empty it.
    const queryClient = clientHolding(standIn);
    getResumeProfile.mockRejectedValue(new Error("offline"));
    await expect(options.loader({ context: { queryClient } })).resolves.toEqual(
      standIn,
    );
    const page = mountPage(queryClient);
    await vi.waitFor(() =>
      expect(queryClient.getQueryState(resumeQuery.queryKey)?.status).toBe(
        "error",
      ),
    );
    expect(page.shown()).toEqual(standIn);
    expect(cached(queryClient)).toEqual(standIn);
    page.unmount();
  });
});

/*
 * A stand-in that reaches the page without the loader's mark: the server
 * drew it (a direct load during an outage), or a first client visit read
 * it. The loader does not run again while the page stays open, so the
 * query's own stale time is what lets the page ask.
 */
describe("/resume: a stand-in that stays on screen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    focusManager.setFocused(undefined);
    vi.useRealTimers();
  });

  it("asks when it mounts if the stand-in is more than a second old", async () => {
    // A server render that took a moment to reach the browser and hydrate.
    const queryClient = clientHolding(standIn, 5_000);
    getResumeProfile.mockResolvedValue(fromSanity);
    const page = mountPage(queryClient);
    expect(page.shown()).toEqual(standIn);
    await vi.waitFor(() => expect(page.shown()).toEqual(fromSanity));
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    page.unmount();
  });

  it("does not ask twice in a row: a stand-in read a moment ago is left alone on mount", async () => {
    const queryClient = clientHolding(standIn);
    const page = mountPage(queryClient);
    await settled(queryClient);
    expect(getResumeProfile).not.toHaveBeenCalled();
    page.unmount();
  });

  it("asks each time the window regains focus, until a read succeeds", async () => {
    const queryClient = clientHolding(standIn);
    const page = mountPage(queryClient);
    // Sanity is still down: the answer is another stand-in.
    getResumeProfile.mockResolvedValue(standIn);
    refocusAfter(2_000);
    await vi.waitFor(() => expect(getResumeProfile).toHaveBeenCalledTimes(1));
    await settled(queryClient);
    expect(page.shown()).toEqual(standIn);
    // Sanity is back.
    getResumeProfile.mockResolvedValue(fromSanity);
    refocusAfter(2_000);
    await vi.waitFor(() => expect(page.shown()).toEqual(fromSanity));
    expect(getResumeProfile).toHaveBeenCalledTimes(2);
    // A good read never goes stale: no further focus asks again.
    refocusAfter(3_600_000);
    await settled(queryClient);
    expect(getResumeProfile).toHaveBeenCalledTimes(2);
    page.unmount();
  });

  it("never asks again for a good read, on mount or on focus", async () => {
    const queryClient = clientHolding(fromSanity, 3_600_000);
    const page = mountPage(queryClient);
    refocusAfter(3_600_000);
    await settled(queryClient);
    expect(getResumeProfile).not.toHaveBeenCalled();
    expect(page.shown()).toEqual(fromSanity);
    page.unmount();
  });
});
