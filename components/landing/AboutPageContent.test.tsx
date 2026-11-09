import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AboutPageContent from "@/components/landing/AboutPageContent";
import ContributionActivity from "@/components/landing/ContributionActivity";
import { aboutPage } from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { learnOperatorNotes } from "@/lib/content/learn";
import {
  activityLevelClass,
  normalizeContributionCalendar,
} from "@/lib/github/contributions";

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

describe("AboutPageContent", () => {
  it("lays the sections out as one dense bento of labelled cards", () => {
    const { container } = render(<AboutPageContent />);
    const grid = container.firstElementChild!;
    expect(grid.className).toMatch(/\bbento\b/);
    expect(grid.className).toMatch(/grid-flow-row-dense/);
    for (const name of [
      aboutPage.story.eyebrow,
      aboutPage.path.eyebrow,
      aboutPage.principles.eyebrow,
      aboutPage.now.eyebrow,
      "Activity",
      aboutPage.stack.eyebrow,
      aboutPage.faq.eyebrow,
      aboutPage.cta.eyebrow,
    ]) {
      expect(screen.getByRole("article", { name })).toBeInTheDocument();
    }
  });

  it("keeps the section ids that the hero and Learn link to", () => {
    const { container } = render(<AboutPageContent />);
    const ids = [
      aboutPage.hero.storyHref.slice(1),
      ...learnOperatorNotes.map((note) => note.href.split("#")[1]!),
      "activity",
      "stack",
      "path",
    ];
    for (const id of ids) {
      expect(container.querySelector(`article#${id}`), id).not.toBeNull();
    }
  });

  it("renders every FAQ answer with text identical to FAQ_ITEMS, only the first open", () => {
    render(<AboutPageContent />);
    const faq = screen.getByRole("article", { name: aboutPage.faq.eyebrow });
    const buttons = within(faq).getAllByRole("button");
    expect(buttons).toHaveLength(FAQ_ITEMS.length);
    FAQ_ITEMS.forEach((item, i) => {
      expect(buttons[i]).toHaveTextContent(item.question);
      const answer = document.getElementById(
        buttons[i]!.getAttribute("aria-controls")!,
      )!;
      // Closed answers stay in the HTML, so the page matches the FAQPage JSON-LD.
      expect(answer).toHaveTextContent(item.answer);
      expect(buttons[i]).toHaveAttribute("aria-expanded", String(i === 0));
      expect(answer.hidden).toBe(i !== 0);
    });
  });

  it("opens and closes an answer from its question", () => {
    render(<AboutPageContent />);
    const question = screen.getByRole("button", {
      name: FAQ_ITEMS[1]!.question,
    });
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(question.getAttribute("aria-controls")!)!.hidden,
    ).toBe(false);
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "false");
  });

  it("leads the Next card with an ink Contact button", () => {
    render(<AboutPageContent />);
    const next = screen.getByRole("article", { name: aboutPage.cta.eyebrow });
    const links = within(next).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      aboutPage.cta.links.map((l) => l.href),
    );
    expect(links[0]!.className).toMatch(/bg-cta/);
  });
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

describe("activityLevelClass", () => {
  it("maps levels 0-4 to theme-aware classes and clamps out-of-range values", () => {
    expect(activityLevelClass(0)).toBe("bg-hairline-strong");
    expect(activityLevelClass(4)).toBe("bg-link");
    expect(activityLevelClass(9)).toBe("bg-link");
    expect(activityLevelClass(-2)).toBe("bg-hairline-strong");
  });
});
