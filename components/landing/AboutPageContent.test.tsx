import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AboutPageContent from "@/components/landing/AboutPageContent";
import ContributionActivity from "@/components/landing/ContributionActivity";
import { aboutPage } from "@/lib/content/aboutPage";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { aboutRecruiterLinks } from "@/lib/content/contact";
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
    const items = faq.querySelectorAll("details");
    expect(items).toHaveLength(FAQ_ITEMS.length);
    FAQ_ITEMS.forEach((item, i) => {
      const details = items[i]!;
      expect(details.querySelector("summary")).toHaveTextContent(item.question);
      // Every answer is in the HTML with no hidden attribute, so the page
      // matches the FAQPage JSON-LD and text extractors read all of them.
      const answer = details.querySelector("p")!;
      expect(answer).toHaveTextContent(item.answer);
      expect(answer.closest("[hidden]")).toBeNull();
      expect(details.open).toBe(i === 0);
    });
  });

  it("opens an answer from its question (native details)", () => {
    render(<AboutPageContent />);
    const faq = screen.getByRole("article", { name: aboutPage.faq.eyebrow });
    const second = faq.querySelectorAll("details")[1]!;
    expect(second.open).toBe(false);
    second.open = true;
    expect(second.open).toBe(true);
    expect(second.querySelector("summary h4")).toHaveTextContent(
      FAQ_ITEMS[1]!.question,
    );
  });

  it("leads the Next card's buttons with an ink Contact button", () => {
    render(<AboutPageContent />);
    const next = screen.getByRole("article", { name: aboutPage.cta.eyebrow });
    const links = within(next).getAllByRole("link");
    // In reading order: the recruiter block's links, then the buttons.
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      ...aboutRecruiterLinks.map((l) => l.href),
      ...aboutPage.cta.links.map((l) => l.href),
    ]);
    // The ink button serves every reader, so it opens the general form.
    const contact = within(next).getByRole("link", { name: "Contact" });
    expect(contact).toHaveAttribute("href", "/contact");
    expect(contact.className).toMatch(/bg-cta/);
  });

  it("answers a recruiter's first questions in the Next card", () => {
    render(<AboutPageContent />);
    const next = screen.getByRole("article", { name: aboutPage.cta.eyebrow });
    expect(
      within(next).getByRole("heading", { level: 4, name: "For recruiters" }),
    ).toBeInTheDocument();
    expect(next).toHaveTextContent(OPEN_TO_ROLES.sentence);
    expect(next).toHaveTextContent("Bangkok time, GMT+7.");
    // A recruiter's own link opens the form with Hiring chosen.
    expect(
      within(next).getByRole("link", { name: "Contact about a role →" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    const pdf = within(next).getByRole("link", { name: "Download PDF →" });
    expect(pdf).toHaveAttribute("href", "/resume.pdf");
    expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    // It leaves the site, and says so to a screen reader.
    const linkedin = within(next).getByRole("link", {
      name: "LinkedIn → (opens in a new tab)",
    });
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/kunanonj",
    );
    expect(linkedin).toHaveAttribute("target", "_blank");
    // Nothing the owner has not approved: no notice period, no visa status.
    expect(next).not.toHaveTextContent(/notice|visa|authori[sz]/i);
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
