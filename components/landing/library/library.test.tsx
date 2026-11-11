import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BuildPage from "@/components/landing/library/BuildPage";
import ExamplesPage from "@/components/landing/library/ExamplesPage";
import LearnPage from "@/components/landing/library/LearnPage";
import ProofPage from "@/components/landing/library/ProofPage";
import StackPage from "@/components/landing/library/StackPage";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { examplesByPersona } from "@/lib/content/examples";
import { TOPIC_SLUGS, getTopicPillar } from "@/lib/content/topics/pillars";
import { buildBoard } from "@/lib/content/buildBoard";

/** Every href on the page: none may point at the hidden blog or press. */
function expectNoHiddenLinks(container: HTMLElement) {
  for (const a of container.querySelectorAll("a")) {
    const href = a.getAttribute("href") ?? "";
    expect(href, a.textContent ?? "").not.toMatch(/^\/press(\/|$|\?|#)/);
    if (!BLOG_PUBLIC)
      expect(href, a.textContent ?? "").not.toMatch(/^\/blog(\/|$|\?|#)/);
  }
}

describe("LearnPage", () => {
  const renderLearn = (lang: "en" | "th", onLangChange = vi.fn()) =>
    render(
      <LearnPage
        posts={FALLBACK_BLOG_POSTS}
        lang={lang}
        onLangChange={onLangChange}
      />,
    );

  it("shows the hubs in English, linked in English with a Thai alternate", () => {
    const { container } = renderLearn("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "How I think about AI transformation, internal systems, and shipping from Bangkok.",
    );
    const ai = getTopicPillar("ai-transformation-thailand", "en");
    const card = screen.getByRole("article", { name: ai?.h1 });
    expect(
      within(card).getByRole("link", { name: "Open hub →" }),
    ).toHaveAttribute("href", "/topics/ai-transformation-thailand");
    expect(
      within(card).getByRole("link", { name: "อ่านภาษาไทย →" }),
    ).toHaveAttribute("href", "/th/topics/ai-transformation-thailand");
    expect(
      screen.getByText(`Showing ${TOPIC_SLUGS.length} hubs in English`),
    ).toBeInTheDocument();
    expectNoHiddenLinks(container);
  });

  it("shows the hubs in Thai under ?lang=th", () => {
    renderLearn("th");
    for (const slug of TOPIC_SLUGS) {
      const th = getTopicPillar(slug, "th");
      const heading = screen.getByRole("heading", { level: 2, name: th?.h1 });
      expect(heading).toHaveAttribute("lang", "th");
    }
    expect(
      screen.getByText(`Showing ${TOPIC_SLUGS.length} hubs in Thai`),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ไทย" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("asks the route to switch the language", () => {
    const onLangChange = vi.fn();
    renderLearn("en", onLangChange);
    fireEvent.click(screen.getByRole("button", { name: "ไทย" }));
    expect(onLangChange).toHaveBeenCalledWith("th");
  });

  it("lists the operator notes and no writing while the blog is hidden", () => {
    renderLearn("en");
    const notes = screen.getByRole("article", { name: "Operator notes" });
    expect(within(notes).getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByRole("article", { name: "Writing" }) !== null).toBe(
      BLOG_PUBLIC,
    );
  });
});

describe("ExamplesPage", () => {
  it("shows the chosen persona's examples and reports the count", () => {
    const { container } = render(
      <ExamplesPage persona="operators" onPersonaChange={() => {}} />,
    );
    for (const card of examplesByPersona.operators) {
      expect(
        screen.getByRole("article", { name: card.title }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("3 examples for Operators")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Operators/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expectNoHiddenLinks(container);
  });

  it("asks the route to switch persona", () => {
    const onPersonaChange = vi.fn();
    render(
      <ExamplesPage persona="builders" onPersonaChange={onPersonaChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Founders/ }));
    expect(onPersonaChange).toHaveBeenCalledWith("founders");
  });
});

describe("StackPage", () => {
  const groupCards = () =>
    ["Build", "Ship", "Operate"].filter(
      (name) => screen.queryByRole("article", { name }) !== null,
    );

  it("shows every group and the through-line by default", () => {
    const { container } = render(
      <StackPage group="all" onGroupChange={() => {}} />,
    );
    expect(groupCards()).toEqual(["Build", "Ship", "Operate"]);
    expect(
      screen.getByRole("article", { name: "Through-line" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing all 16 tools")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^NestJS/ })).toHaveAttribute(
      "href",
      "https://nestjs.com",
    );
    expectNoHiddenLinks(container);
  });

  it("narrows to one group under ?group=", () => {
    render(<StackPage group="ship" onGroupChange={() => {}} />);
    expect(groupCards()).toEqual(["Ship"]);
    expect(
      screen.getByText("Showing 8 of 16 tools · Ship"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Ship/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("asks the route to switch group", () => {
    const onGroupChange = vi.fn();
    render(<StackPage group="all" onGroupChange={onGroupChange} />);
    fireEvent.click(screen.getByRole("button", { name: /^Operate/ }));
    expect(onGroupChange).toHaveBeenCalledWith("operate");
  });
});

describe("ProofPage", () => {
  it("quotes the source of the picked metric", () => {
    const { container } = render(<ProofPage />);
    expect(
      screen.getByText(/Source · GoGoCash case · Where it stands/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /30%/ }));
    expect(
      screen.getByText(/Source · GoGoCash case · What it is/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /30%/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expectNoHiddenLinks(container);
  });

  it("leads with the delivery outcomes, each a link to its case study", () => {
    const { container } = render(<ProofPage />);
    const delivery = screen.getByRole("article", { name: "Delivery" });
    const tiles = within(
      within(delivery).getByRole("list", {
        name: "Outcomes, each linking to its case study",
      }),
    ).getAllByRole("link");
    // The label is read before the figure; the figure is drawn above it.
    expect(tiles.map((tile) => tile.textContent)).toEqual([
      "Adoption · TBH Intranet50+ employeesCase study →",
      "Build cycles · TBH Intranet4 months to 1 weekCase study →",
      "Recurring workflow staffing · AI Automation10 people to 1 operatorCase study →",
      "Turnaround · AI Automation30 minutesCase study →",
    ]);
    expect(tiles.map((tile) => tile.getAttribute("href"))).toEqual([
      "/portfolio/tbh-intranet",
      "/portfolio/tbh-intranet",
      "/portfolio/ai-automation",
      "/portfolio/ai-automation",
    ]);
    expect(delivery).toHaveTextContent(
      "04 outcomes · TBH Intranet · AI Automation",
    );
    // They are his own figures: the card says where he states them.
    expect(
      within(delivery).getByRole("link", { name: "As stated in the résumé →" }),
    ).toHaveAttribute("href", "/resume");
    // Before the venture metrics: what a hiring reader came for.
    const articles = [...container.querySelectorAll("article")];
    expect(articles.indexOf(delivery)).toBeLessThan(
      articles.indexOf(
        screen.getByRole("article", { name: "Venture metrics" }),
      ),
    );
  });

  it("says in the lead what the page holds, without repeating the h1", () => {
    render(<ProofPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Honest signals: venture metrics and case studies. No invented scores.",
    );
    const lead = h1.nextElementSibling!;
    expect(lead).toHaveTextContent(/^Delivery outcomes, as the résumé states/);
    for (const phrase of ["Honest signals", "No invented scores"])
      expect(lead.textContent).not.toContain(phrase);
  });

  it("dates GoGoCash's running totals on the tile and in the quote", () => {
    render(<ProofPage />);
    for (const [value, label] of [
      ["THB 13 million", "Cumulative gross merchandise value"],
      ["THB 169,000", "Cashback paid"],
    ]) {
      const tile = screen.getByRole("button", { name: new RegExp(value!) });
      expect(tile).toHaveTextContent(
        `${value}${label} · GoGoCashAs of October 2026`,
      );
      fireEvent.click(tile);
      expect(
        screen.getByText(/Source · GoGoCash case · Where it stands/),
      ).toBeInTheDocument();
      expect(screen.getByRole("blockquote")).toHaveTextContent(
        "“As of October 2026, cumulative gross merchandise value is THB 13 million and cashback paid is THB 169,000.”",
      );
    }
    // An undated figure carries no date.
    expect(screen.getByRole("button", { name: /220\+/ })).not.toHaveTextContent(
      "As of",
    );
  });

  it("shows a case card per venture with its live site and case page", () => {
    render(<ProofPage />);
    for (const [name, slug] of [
      ["Manut AI", "manut"],
      ["GoGoCash", "gogocash"],
    ]) {
      const card = screen.getByRole("article", { name: `${name} case` });
      expect(
        within(card).getByRole("link", { name: `View the ${name} case` }),
      ).toHaveAttribute("href", `/ventures/${slug}`);
    }
  });
});

describe("BuildPage", () => {
  it("shows the whole board by default", () => {
    const { container } = render(
      <BuildPage venture="all" onVentureChange={() => {}} />,
    );
    const total = Object.values(buildBoard).flat().length;
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(total);
    expect(
      screen.getByText(`${total} tickets on the board`),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing here for this filter.")).toBeNull();
    expectNoHiddenLinks(container);
  });

  it("narrows to one venture and marks emptied columns", () => {
    render(<BuildPage venture="manut" onVentureChange={() => {}} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    const total = Object.values(buildBoard).flat().length;
    expect(
      screen.getByText(`2 of ${total} tickets · Manut`),
    ).toBeInTheDocument();
    const inProgress = screen.getByRole("article", { name: "In progress" });
    expect(
      within(inProgress).getByText("Nothing here for this filter."),
    ).toBeInTheDocument();
    expect(within(inProgress).getByText("00 tickets")).toBeInTheDocument();
  });

  it("asks the route to switch venture", () => {
    const onVentureChange = vi.fn();
    render(<BuildPage venture="all" onVentureChange={onVentureChange} />);
    fireEvent.click(screen.getByRole("button", { name: /^GoGoCash/ }));
    expect(onVentureChange).toHaveBeenCalledWith("gogocash");
  });
});

describe("hubLayout", () => {
  it("keeps the canvas layout for three hubs and fills every row after", async () => {
    const { hubLayout } =
      await import("@/components/landing/library/LearnPage");
    expect([0, 1, 2].map((i) => hubLayout(i, 3).span)).toEqual([2, 1, 2]);
    expect(hubLayout(3, 4).span).toBe(3);
    expect([3, 4].map((i) => hubLayout(i, 5).span)).toEqual([1, 2]);
    expect(hubLayout(5, 6).span).toBe(3);
  });
});
