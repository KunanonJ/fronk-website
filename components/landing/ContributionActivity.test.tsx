import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContributionActivity from "@/components/landing/ContributionActivity";
import {
  activityLevelClass,
  normalizeContributionCalendar,
} from "@/lib/github/contributions";

/*
 * About's GitHub year (moved here from the About bento's test at the Phase 6
 * cutover, unchanged): the card stays on the restyled /about.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  // ContributionActivity fetches GitHub data on mount; keep tests offline.
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ ok: false }), { status: 503 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ContributionActivity", () => {
  it("shows an empty year, not invented data, while GitHub is unavailable", async () => {
    const { container } = render(<ContributionActivity />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const grid = screen.getByRole("img", { name: /GitHub contribution/ });
    expect(grid.querySelectorAll("span > span")).toHaveLength(53 * 7);
    expect(grid.querySelector(".bg-link")).toBeNull();
    expect(container.textContent).not.toMatch(/Illustrative|not real data/);
  });

  it("draws the real calendar from /api/github/contributions", async () => {
    const calendar = normalizeContributionCalendar(
      [
        {
          contributionDays: [
            { date: "2026-11-01", contributionCount: 12 },
            { date: "2026-11-02", contributionCount: 1 },
          ],
        },
      ],
      1234,
    );
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(calendar), { status: 200 }),
    );
    render(<ContributionActivity />);
    expect(
      await screen.findByText("1,234 contributions · @KunanonJ"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/github/contributions");
    expect(
      screen.getByTitle("2026-11-01 · 12 contributions").className,
    ).toMatch(/\bbg-link\b/);
    expect(
      screen.getByRole("region", { name: /scrolls sideways/ }),
    ).toHaveAttribute("tabindex", "0");
  });
});

describe("ContributionActivity's fill-in", () => {
  /** An observer the test can trigger, and a grid placed below the fold. */
  function belowTheFold() {
    const observed: { fire: () => void } = { fire: () => {} };
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          observed.fire = () =>
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 5000,
    } as DOMRect);
    return observed;
  }
  const grid = () => screen.getByRole("img", { name: /GitHub contribution/ });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("holds a year below the fold empty until it comes into view", async () => {
    const observed = belowTheFold();
    render(<ContributionActivity />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(grid()).toHaveAttribute("data-wait");
    act(() => observed.fire());
    expect(grid()).not.toHaveAttribute("data-wait");
  });

  it("never holds it under reduced motion", async () => {
    belowTheFold();
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    render(<ContributionActivity />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(grid()).not.toHaveAttribute("data-wait");
  });

  it("gives each week its place in the fill-in", () => {
    render(<ContributionActivity />);
    const weeks = grid().querySelectorAll<HTMLElement>(".pf-activity__week");
    expect(weeks).toHaveLength(53);
    expect(weeks[0]!.style.getPropertyValue("--w")).toBe("0");
    expect(weeks[52]!.style.getPropertyValue("--w")).toBe("52");
  });
});

describe("activityLevelClass", () => {
  it("maps levels 0-4 to theme-aware classes and clamps out-of-range values", () => {
    expect(activityLevelClass(0)).toBe("bg-hairline-strong");
    expect(activityLevelClass(4)).toBe("bg-link");
    expect(activityLevelClass(9)).toBe("bg-link");
    expect(activityLevelClass(-2)).toBe("bg-hairline-strong");
  });
});
