import { Suspense } from "react";
import {
  QueryClientProvider,
  focusManager,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/src/lib/queryClient";

/*
 * resumeQuery under the hook the page uses (recruiter-fit phase 3).
 * src/lib/resumeRoute.test.ts models the page with a QueryObserver and adds
 * by hand the one-second floor useSuspenseQuery puts under a stale time.
 * These three tests run the hook itself, so that model cannot drift from
 * the library: a stand-in read a moment ago is left alone, an older one is
 * asked for again on mount and on focus, and a good read never is.
 */

const getResumeProfile = vi.hoisted(() => vi.fn());
vi.mock("@/src/server/content.functions", () => ({
  getResumeProfile,
  getBlogIndex: vi.fn(),
  getBlogPost: vi.fn(),
  getLearnCards: vi.fn(),
}));

const { resumeQuery } = await import("@/src/queries/content");

type Profile = { name: string; degraded: boolean };
const fromSanity: Profile = { name: "From Sanity", degraded: false };
const standIn: Profile = { name: "From the repo", degraded: true };

function Page() {
  const profile = useSuspenseQuery(resumeQuery).data;
  return <p>{profile.name}</p>;
}

/** The page drawn from a client that already holds `profile`, read `ageMs` ago. */
function drawWith(profile: Profile, ageMs = 0): QueryClient {
  const queryClient = createQueryClient();
  queryClient.setQueryData(resumeQuery.queryKey, profile as never, {
    updatedAt: Date.now() - ageMs,
  });
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading</p>}>
        <Page />
      </Suspense>
    </QueryClientProvider>,
  );
  return queryClient;
}

/** The window loses focus and regains it, `afterMs` later. */
function refocusAfter(afterMs: number) {
  vi.setSystemTime(Date.now() + afterMs);
  focusManager.setFocused(false);
  focusManager.setFocused(true);
}

const turn = () => new Promise((done) => setTimeout(done, 20));

beforeEach(() => {
  getResumeProfile.mockReset();
  vi.useFakeTimers({ toFake: ["Date"] });
});
afterEach(() => {
  focusManager.setFocused(undefined);
  vi.useRealTimers();
});

describe("the résumé under useSuspenseQuery", () => {
  it("leaves a stand-in read a moment ago alone, then asks when the window regains focus", async () => {
    drawWith(standIn);
    expect(screen.getByText("From the repo")).toBeInTheDocument();
    await turn();
    expect(getResumeProfile).not.toHaveBeenCalled();
    getResumeProfile.mockResolvedValue(fromSanity);
    refocusAfter(2_000);
    expect(await screen.findByText("From Sanity")).toBeInTheDocument();
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
    // A good read now: another focus, an hour on, asks nothing.
    refocusAfter(3_600_000);
    await turn();
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
  });

  it("asks on mount for a stand-in more than a second old, and redraws", async () => {
    getResumeProfile.mockResolvedValue(fromSanity);
    drawWith(standIn, 5_000);
    expect(await screen.findByText("From Sanity")).toBeInTheDocument();
    expect(getResumeProfile).toHaveBeenCalledTimes(1);
  });

  it("never asks again for a good read, on mount or on focus", async () => {
    drawWith(fromSanity, 3_600_000);
    refocusAfter(3_600_000);
    await turn();
    expect(screen.getByText("From Sanity")).toBeInTheDocument();
    expect(getResumeProfile).not.toHaveBeenCalled();
  });
});
