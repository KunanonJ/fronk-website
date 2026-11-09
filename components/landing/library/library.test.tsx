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
import { getTopicPillar } from "@/lib/content/topics/pillars";

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
    expect(screen.getByText("Showing 3 hubs in English")).toBeInTheDocument();
    expectNoHiddenLinks(container);
  });

  it("shows the hubs in Thai under ?lang=th", () => {
    renderLearn("th");
    for (const slug of [
      "ai-transformation-thailand",
      "erp-crm-internal-systems",
      "tech-startup-thailand-sea",
    ]) {
      const th = getTopicPillar(slug, "th");
      const heading = screen.getByRole("heading", { level: 2, name: th?.h1 });
      expect(heading).toHaveAttribute("lang", "th");
    }
    expect(screen.getByText("Showing 3 hubs in Thai")).toBeInTheDocument();
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
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(11);
    expect(screen.getByText("11 tickets on the board")).toBeInTheDocument();
    expect(screen.queryByText("Nothing here for this filter.")).toBeNull();
    expectNoHiddenLinks(container);
  });

  it("narrows to one venture and marks emptied columns", () => {
    render(<BuildPage venture="manut" onVentureChange={() => {}} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.getByText("2 of 11 tickets · Manut")).toBeInTheDocument();
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
