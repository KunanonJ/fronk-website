import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import BuildPage from "@/components/profile/pages/library/BuildPage";
import ExamplesPage from "@/components/profile/pages/library/ExamplesPage";
import LearnPage from "@/components/profile/pages/library/LearnPage";
import ProofPage from "@/components/profile/pages/library/ProofPage";
import StackPage from "@/components/profile/pages/library/StackPage";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { buildBoard } from "@/lib/content/buildBoard";
import { examplesByPersona } from "@/lib/content/examples";
import { stackItems } from "@/lib/content/stack";
import { orbitRing } from "@/lib/landing/journey";
import { TOPIC_SLUGS, getTopicPillar } from "@/lib/content/topics/pillars";

/*
 * The reading pages (profile redesign, Phase 7 lane D1, plan step 7d). The
 * intents of the bento pages' tests, on the new layouts: the h1s word for
 * word, each filter's labels, counts and result line, Delivery before the
 * venture metrics with the running totals dated, and no link to the hidden
 * blog or press.
 */

/** Every href on the page: none may point at the hidden blog or press. */
function expectNoHiddenLinks(container: HTMLElement) {
  for (const a of container.querySelectorAll("a")) {
    const href = a.getAttribute("href") ?? "";
    expect(href, a.textContent ?? "").not.toMatch(/^\/press(\/|$|\?|#)/);
    if (!BLOG_PUBLIC)
      expect(href, a.textContent ?? "").not.toMatch(/^\/blog(\/|$|\?|#)/);
  }
}

const reference = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/site-parity.json"), "utf8"),
) as Record<string, { h1: string | null }>;

describe("the reading pages' h1s", () => {
  it.each([
    [
      "/learn",
      <LearnPage
        key="learn"
        posts={FALLBACK_BLOG_POSTS}
        lang="en"
        onLangChange={() => {}}
      />,
    ],
    [
      "/examples",
      <ExamplesPage
        key="examples"
        persona="builders"
        onPersonaChange={() => {}}
      />,
    ],
    ["/stack", <StackPage key="stack" group="all" onGroupChange={() => {}} />],
    ["/proof", <ProofPage key="proof" />],
    [
      "/build",
      <BuildPage key="build" venture="all" onVentureChange={() => {}} />,
    ],
  ] as [string, ReactElement][])(
    "%s reads as the parity reference, in the hero's sky",
    (path, page) => {
      render(page);
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      // The parity gate strips the tags and collapses the spaces.
      expect(h1s[0]!.textContent!.replace(/\s+/g, " ").trim()).toBe(
        reference[path]!.h1,
      );
      expect(h1s[0]).toHaveClass("t-display");
      expect(h1s[0]!.closest("section")).toHaveClass("pf-page-hero");
      // The last line is the accent.
      expect(h1s[0]!.lastElementChild).toHaveClass("pf-page-hero__accent");
    },
  );
});

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
    // The first hub leads: its path and the other language.
    expect(card).toHaveClass("pf-read-lead");
    expect(card).toHaveTextContent("EN · /topics/ai-transformation-thailand");
    expect(
      within(card).getByRole("link", { name: "Open hub" }),
    ).toHaveAttribute("href", "/topics/ai-transformation-thailand");
    const thai = within(card).getByRole("link", { name: "อ่านภาษาไทย" });
    expect(thai).toHaveAttribute(
      "href",
      "/th/topics/ai-transformation-thailand",
    );
    expect(thai).toHaveAttribute("lang", "th");
    expect(thai).toHaveAttribute("hreflang", "th");
    expect(
      screen.getByText(`Showing ${TOPIC_SLUGS.length} hubs in English`),
    ).toHaveAttribute("aria-live", "polite");
    // The other hubs follow, each with its own link.
    expect(
      screen
        .getAllByRole("article")
        .filter((article) => article.classList.contains("pf-read-lead")),
    ).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Open hub" })).toHaveLength(
      TOPIC_SLUGS.length,
    );
    expectNoHiddenLinks(container);
  });

  it("shows the hubs in Thai under ?lang=th", () => {
    renderLearn("th");
    for (const slug of TOPIC_SLUGS) {
      const th = getTopicPillar(slug, "th");
      // Under the h2 "Read the hubs in", each hub's title is an h3.
      const heading = screen.getByRole("heading", { level: 3, name: th?.h1 });
      expect(heading).toHaveAttribute("lang", "th");
    }
    expect(
      screen.getByRole("heading", { level: 2, name: "Read the hubs in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Showing ${TOPIC_SLUGS.length} hubs in Thai`),
    ).toBeInTheDocument();
    const group = screen.getByRole("group", { name: "Hub language" });
    expect(within(group).getByRole("button", { name: "ไทย" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      within(group).getByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "false");
    // The codes are drawn, as before, and not read: the names stay the words.
    expect(
      within(group).getByRole("button", { name: "ไทย" }),
    ).toHaveTextContent("ไทย TH");
    expect(
      [...group.querySelectorAll(".pf-read-count")].map((code) => [
        code.textContent,
        code.getAttribute("aria-hidden"),
      ]),
    ).toEqual([
      ["EN", "true"],
      ["TH", "true"],
    ]);
    // The header shows the chosen language's code.
    expect(
      screen.getByRole("heading", { level: 2, name: "Read the hubs in" })
        .parentElement,
    ).toHaveTextContent("Read the hubs inTH");
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
    const links = within(notes).getAllByRole("link");
    expect(links).toHaveLength(3);
    // Each "Open" link names its note.
    expect(links[0]).toHaveAccessibleName("Open: Four operating principles");
    expect(notes).toHaveTextContent("03 notes");
    expect(screen.queryByRole("article", { name: "Writing" }) !== null).toBe(
      BLOG_PUBLIC,
    );
    expect(
      screen.getByRole("list", { name: "On this page" }),
    ).toHaveTextContent("Topic hubs");
  });
});

describe("ExamplesPage", () => {
  it("shows the chosen persona's examples and reports the count", () => {
    const { container } = render(
      <ExamplesPage persona="operators" onPersonaChange={() => {}} />,
    );
    for (const card of examplesByPersona.operators) {
      const article = screen.getByRole("article", { name: card.title });
      expect(article).toHaveTextContent(card.body);
      expect(
        within(article).getByRole("link", { name: card.ctaLabel }),
      ).toHaveAttribute("href", card.href);
    }
    expect(screen.getByText("3 examples for Operators")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getByRole("button", { name: /Operators/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expectNoHiddenLinks(container);
  });

  it("asks who the examples are for, each persona with its number and count", () => {
    render(<ExamplesPage persona="builders" onPersonaChange={() => {}} />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Show examples for",
    });
    // The picker is named by that heading.
    const group = screen.getByRole("group", { name: "Show examples for" });
    expect(group).toHaveAttribute("aria-labelledby", heading.id);
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "01 · 3 examplesBuilders",
      "02 · 3 examplesOperators",
      "03 · 3 examplesFounders",
    ]);
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
  const groupTiles = () =>
    ["Build", "Ship", "Operate"].filter(
      (name) => screen.queryByRole("article", { name }) !== null,
    );

  it("shows every group and the through-line by default", () => {
    const { container } = render(
      <StackPage group="all" onGroupChange={() => {}} />,
    );
    expect(groupTiles()).toEqual(["Build", "Ship", "Operate"]);
    expect(
      screen.getByRole("article", { name: "Through-line" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing all 16 tools")).toBeInTheDocument();
    const nest = screen.getByRole("link", { name: /^NestJS/ });
    expect(nest).toHaveAttribute("href", "https://nestjs.com");
    // A new tab says so.
    expect(nest).toHaveAttribute("target", "_blank");
    expect(nest).toHaveTextContent("(opens in a new tab)");
    expectNoHiddenLinks(container);
  });

  it("draws each tool's pixel badge from the Journey orbit, hidden from readers", () => {
    const { container } = render(
      <StackPage group="all" onGroupChange={() => {}} />,
    );
    const badges = container.querySelectorAll(
      "a svg.pf-px[aria-hidden='true']",
    );
    expect(badges).toHaveLength(stackItems.length);
    // Every tool wears the colour it has in the Home's orbit.
    const tones = new Map(
      orbitRing().flatMap((item) =>
        item.type === "tool" ? [[item.name, item.tone] as const] : [],
      ),
    );
    expect(new Set(tones.values()).size).toBeGreaterThan(1);
    for (const item of stackItems) {
      const link = screen.getByRole("link", {
        name: new RegExp(
          `^${item.name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`,
        ),
      });
      expect(link.querySelector("svg"), item.name).toHaveClass(
        `pf-px--${tones.get(item.name)}`,
      );
    }
    // Two that are not the violet the code falls back to.
    expect(
      screen.getByRole("link", { name: /^Next\.js/ }).querySelector("svg"),
    ).toHaveClass("pf-px--ink");
    expect(
      screen
        .getByRole("link", { name: /^Expo \/ React Native/ })
        .querySelector("svg"),
    ).toHaveClass("pf-px--coral");
  });

  it("narrows to one group under ?group=", () => {
    render(<StackPage group="ship" onGroupChange={() => {}} />);
    expect(groupTiles()).toEqual(["Ship"]);
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
    // They are his own figures: the block says where he states them.
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
      expect(tile).toHaveClass("pf-read-pick--wide");
      fireEvent.click(tile);
      expect(
        screen.getByText(/Source · GoGoCash case · Where it stands/),
      ).toBeInTheDocument();
      expect(screen.getByRole("blockquote")).toHaveTextContent(
        "“As of October 2026, cumulative gross merchandise value is THB 13 million and cashback paid is THB 169,000.”",
      );
    }
    // An undated figure carries no date.
    const undated = screen.getByRole("button", { name: /220\+/ });
    expect(undated).not.toHaveTextContent("As of");
    expect(undated).not.toHaveClass("pf-read-pick--wide");
  });

  it("shows a case tile per venture with its live site and case page", () => {
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
    for (const name of ["Next", "In progress", "Shipped"]) {
      expect(screen.getByRole("article", { name })).toHaveClass("ds-tile");
    }
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
