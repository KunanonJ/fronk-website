import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import PortfolioIndexPage from "@/components/landing/portfolio/PortfolioIndexPage";
import PortfolioProjectPage from "@/components/landing/portfolio/PortfolioProjectPage";
import {
  getAllPortfolioProjects,
  getPortfolioProjectBySlug,
} from "@/lib/content/portfolio";
import type { PortfolioFilter } from "@/lib/portfolio/search";

const projects = getAllPortfolioProjects();

function renderIndex(
  category: PortfolioFilter = "all",
  onCategoryChange = vi.fn(),
) {
  render(
    <PortfolioIndexPage
      category={category}
      onCategoryChange={onCategoryChange}
    />,
  );
  return onCategoryChange;
}

function renderProject(slug: string) {
  const project = getPortfolioProjectBySlug(slug)!;
  render(
    <ChromeProvider>
      <PortfolioProjectPage project={project} />
    </ChromeProvider>,
  );
  return project;
}

const cards = () =>
  screen
    .getAllByRole("article")
    .filter((card) => card.closest(".bento") !== null);

describe("PortfolioIndexPage", () => {
  it("leads with the canvas h1, its last line in the accent", () => {
    renderIndex();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Selected work: internal tools, automations and AI agents.",
    );
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
    expect(h1.children[2]?.className).toMatch(/text-mark/);
  });

  it("shows every project as a card labelled by its name, in list order", () => {
    renderIndex();
    expect(cards().map((card) => card.getAttribute("aria-labelledby"))).toEqual(
      projects.map((p) => `name-${p.slug}`),
    );
    for (const p of projects) {
      const card = screen.getByRole("article", { name: p.name });
      expect(
        within(card).getByRole("link", { name: `View project: ${p.name}` }),
      ).toHaveAttribute("href", `/portfolio/${p.slug}`);
      expect(
        within(card).getByText(p.category, { selector: "h2" }),
      ).toBeInTheDocument();
      expect(
        within(card).getByText("Illustrative mockup, not real data."),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("4 of 4 projects")).toBeInTheDocument();
  });

  it("draws the canvas grid: TBH 2 | Node 1, Email 1 | AI 2", () => {
    renderIndex();
    const [tbh, node, email, ai] = cards();
    expect(tbh!.className).toMatch(/min-\[641px\]:col-span-2/);
    expect(node!.className).not.toMatch(/col-span/);
    expect(email!.className).not.toMatch(/col-span/);
    expect(ai!.className).toMatch(/min-\[641px\]:col-span-2/);
  });

  it("caps the tech chips at four, then counts the rest", () => {
    renderIndex();
    const tbh = screen.getByRole("article", { name: "TBH Intranet" });
    const stack = within(tbh).getByRole("list", { name: "Tech stack" });
    expect(within(stack).getAllByRole("listitem")).toHaveLength(5);
    expect(stack).toHaveTextContent("+13 more");
  });

  it("lists All and each category as pressed buttons", () => {
    const onChange = renderIndex();
    const group = screen.getByRole("group", {
      name: "Filter projects by category",
    });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual([
      "All",
      "Internal platform",
      "Ops automation",
      "Internal tool",
      "AI agents",
    ]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(buttons[4]!);
    expect(onChange).toHaveBeenCalledWith("ai-agents");
  });

  it("narrows to one category, the match spanning the whole row", () => {
    renderIndex("ai-agents");
    expect(cards()).toHaveLength(1);
    const card = screen.getByRole("article", { name: "AI Automation" });
    expect(card.className).toMatch(/lg:col-span-3/);
    expect(within(card).getByText("04")).toBeInTheDocument();
    expect(screen.getByText("1 of 4 projects")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI agents" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("PortfolioProjectPage (TBH Intranet, the drawn project)", () => {
  it("sets the name over the tagline, as the canvas h1", () => {
    renderProject("tbh-intranet");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "TBH Intranet. One back office for a multi-entity group.",
    );
    expect(h1.children).toHaveLength(3);
    expect(h1.children[2]).toHaveTextContent("a multi-entity group.");
    expect(h1.children[2]?.className).toMatch(/text-mark/);
    expect(screen.getByText("Portfolio · Internal platform")).toBeVisible();
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
  });

  it("names Kunanon Jarat with his role, linking to About", () => {
    const project = renderProject("tbh-intranet");
    const author = screen.getByRole("link", { name: "Kunanon Jarat" });
    expect(author).toHaveAttribute("href", "/about");
    expect(author).toHaveAttribute("rel", "author");
    expect(author.parentElement).toHaveTextContent(
      `By Kunanon Jarat · ${project.role}`,
    );
  });

  it("lists role, organisation, period and access", () => {
    renderProject("tbh-intranet");
    for (const [label, value] of [
      ["Role", "IT Manager & AI Engineering Lead"],
      ["Organisation", "The Binary Holdings"],
      ["Period", "May to Oct 2026"],
      ["Access", "Internal tool (login only)"],
    ])
      expect(
        screen.getByText(label!, { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent(value!);
  });

  it("draws the canvas cards with Before / After", () => {
    renderProject("tbh-intranet");
    for (const name of [
      "Interface",
      "The problem",
      "What it does",
      "How it works",
      "Architecture",
      "How it is built",
      "Tech stack",
    ])
      expect(screen.getByRole("article", { name })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Illustrative mockup of TBH Intranet" }),
    ).toBeInTheDocument();
    const problem = screen.getByRole("article", { name: "The problem" });
    expect(within(problem).getByText("Zoho")).toBeInTheDocument();
    expect(
      within(problem).getByText("One login-only web app"),
    ).toBeInTheDocument();
  });

  it("steps through the approval flow, keeping focus on a control", () => {
    renderProject("tbh-intranet");
    const flow = screen.getByRole("article", { name: "How it works" });
    const steps = within(
      within(flow).getByRole("list", { name: "Approval flow" }),
    ).getAllByRole("button");
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveAttribute("aria-pressed", "true");
    expect(within(flow).getByText("Step 01 of 04")).toBeInTheDocument();
    expect(
      within(flow).queryByRole("button", { name: "Previous step" }),
    ).toBeNull();

    const next = within(flow).getByRole("button", { name: "Next step" });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(within(flow).getByText("Step 03 of 04")).toBeInTheDocument();
    expect(
      within(flow).getByText("Recorded", { selector: "p" }),
    ).toBeInTheDocument();
    expect(steps[0]!.firstElementChild!.className).toMatch(/border-mark/);

    fireEvent.click(next);
    expect(
      within(flow).queryByRole("button", { name: "Next step" }),
    ).toBeNull();
    const restart = within(flow).getByRole("button", { name: "Start again" });
    expect(restart).toHaveFocus();

    fireEvent.click(restart);
    expect(within(flow).getByText("Step 01 of 04")).toBeInTheDocument();
    expect(
      within(flow).getByRole("button", { name: "Next step" }),
    ).toHaveFocus();

    fireEvent.click(steps[3]!);
    expect(steps[3]).toHaveAttribute("aria-pressed", "true");
    expect(
      within(flow).getByText("Notified", { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("numbers the architecture layers top to bottom", () => {
    renderProject("tbh-intranet");
    const layers = screen.getByRole("list", { name: "Layers, top to bottom" });
    expect(
      within(layers)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual([
      "01 · Users",
      "02 · Web app",
      "03 · API",
      "04 · Services",
      "05 · Build + hosting",
    ]);
  });

  it("links the previous and next projects around All projects", () => {
    renderProject("tbh-intranet");
    const nav = screen.getByRole("navigation", { name: "More projects" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual([
      "/portfolio/ai-automation",
      "/portfolio",
      "/portfolio/node-validator-automation",
    ]);
  });
});

describe("PortfolioProjectPage (the projects the canvas does not draw)", () => {
  it.each(
    projects.filter((p) => p.slug !== "tbh-intranet").map((p) => [p.slug]),
  )("%s uses the template with its own data", (slug) => {
    const project = renderProject(slug);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(`${project.name}. ${project.tagline}`);
    expect(h1.children).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: "Kunanon Jarat" }).parentElement,
    ).toHaveTextContent(`By Kunanon Jarat · ${project.role}`);
    expect(
      screen.getByRole("img", {
        name: `Illustrative mockup of ${project.name}`,
      }),
    ).toBeInTheDocument();
    const flow = screen.getByRole("list", { name: project.workflow!.title });
    expect(within(flow).getAllByRole("button")).toHaveLength(
      project.workflow!.steps.length,
    );
    expect(
      within(
        screen.getByRole("list", { name: "Layers, top to bottom" }),
      ).getAllByRole("heading", { level: 3 }),
    ).toHaveLength(project.architecture!.layers.length);
    // Only TBH Intranet names a before and after.
    expect(screen.queryByText("Before")).toBeNull();
  });

  it("credits the team project role on AI Automation", () => {
    renderProject("ai-automation");
    expect(
      screen.getByRole("link", { name: "Kunanon Jarat" }).parentElement,
    ).toHaveTextContent(
      "By Kunanon Jarat · AI Engineering Lead (team project)",
    );
  });

  it("drops step labels to dots on phones past four steps", () => {
    renderProject("ai-automation");
    const flow = screen.getByRole("list", { name: "Fando clip pipeline" });
    const label = within(flow).getByText("Find clips");
    expect(label.className).toMatch(/max-\[640px\]:sr-only/);
    renderProject("tbh-intranet");
    expect(
      within(screen.getByRole("list", { name: "Approval flow" })).getByText(
        "Approval chain",
      ).className,
    ).not.toMatch(/sr-only/);
  });
});
