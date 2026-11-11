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
      // A drawn mockup says so; a real screenshot (this site) carries its
      // own description instead.
      expect(
        within(card).queryAllByText("Illustrative mockup, not real data."),
      ).toHaveLength(p.cover ? 0 : 1);
      expect(
        within(card).queryAllByRole("img", { name: p.cover?.alt ?? "none" }),
      ).toHaveLength(p.cover ? 1 : 0);
    }
    expect(screen.getByText("5 of 5 projects")).toBeInTheDocument();
  });

  it("draws the canvas grid, then this site on a row of its own: TBH 2 | Node 1, Email 1 | AI 2, site 3", () => {
    renderIndex();
    const [tbh, node, email, ai, site] = cards();
    expect(tbh!.className).toMatch(/min-\[641px\]:col-span-2/);
    expect(node!.className).not.toMatch(/col-span/);
    expect(email!.className).not.toMatch(/col-span/);
    expect(ai!.className).toMatch(/min-\[641px\]:col-span-2/);
    expect(site).toBe(screen.getByRole("article", { name: "kunanonj.com" }));
    expect(site!.className).toMatch(/lg:col-span-3/);
  });

  it("marks this site public and the employer's tools internal", () => {
    renderIndex();
    for (const project of projects) {
      const card = screen.getByRole("article", { name: project.name });
      // The access tag sits beside the year.
      expect(
        within(card).getByText(String(project.year)).parentElement,
      ).toHaveTextContent(
        `${project.access === "public" ? "Public" : "Internal tool"}${project.year}`,
      );
    }
    expect(
      projects.filter((p) => p.access === "public").map((p) => p.slug),
    ).toEqual(["kunanonj-com"]);
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
      "Website",
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
    expect(screen.getByText("1 of 5 projects")).toBeInTheDocument();
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
      ["Access", "Internal tool (no public link)"],
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
      "/portfolio/kunanonj-com",
      "/portfolio",
      "/portfolio/node-validator-automation",
    ]);
  });
});

describe("PortfolioProjectPage (this site, the public project)", () => {
  it("links the source, not a login-only tool, and claims no outcome", () => {
    const project = renderProject("kunanonj-com");
    const source = screen.getByRole("link", { name: /Source on GitHub/ });
    expect(source).toHaveAttribute(
      "href",
      "https://github.com/KunanonJ/fronk-website",
    );
    expect(source).toHaveAttribute("target", "_blank");
    expect(source).toHaveAttribute("rel", "noopener noreferrer");
    for (const [label, value] of [
      ["Role", "Owner"],
      ["Organisation", "Personal project"],
      ["Access", "Public"],
    ])
      expect(
        screen.getByText(label!, { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent(value!);
    // A screenshot of the real page, sized so the layout does not shift,
    // with no "illustrative" caption.
    const shot = within(
      screen.getByRole("article", { name: "Interface" }),
    ).getByRole("img");
    expect(shot).toHaveAttribute("src", "/portfolio/kunanonj-com/cover.webp");
    expect(shot).toHaveAttribute("width", "1440");
    expect(shot).toHaveAttribute("height", "900");
    expect(shot.getAttribute("alt")).toMatch(/^The Home page of kunanonj\.com/);
    expect(
      screen.queryByText("Illustrative mockup, not real data."),
    ).toBeNull();
    // The CV does not mention the site: no figure and no "my part" is cleared.
    expect(project.outcomes).toBeUndefined();
    expect(project.myPart).toBeUndefined();
    expect(screen.queryByRole("article", { name: "Outcome" })).toBeNull();
    expect(screen.queryByRole("article", { name: "My part" })).toBeNull();
  });

  it("gives no other project a public link", () => {
    for (const other of projects.filter((p) => p.slug !== "kunanonj-com")) {
      const { unmount } = render(
        <ChromeProvider>
          <PortfolioProjectPage project={other} />
        </ChromeProvider>,
      );
      expect(screen.queryByRole("link", { name: /GitHub|Visit/ })).toBeNull();
      unmount();
    }
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
        name: project.cover?.alt ?? `Illustrative mockup of ${project.name}`,
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

describe("PortfolioProjectPage (what changed and his part)", () => {
  /** The grid's cards, in document order, by their heading. */
  const gridCards = () =>
    cards().map((card) => within(card).getAllByRole("heading")[0]!.textContent);

  it.each(["tbh-intranet", "ai-automation"])(
    "opens %s with the outcomes the résumé states, then his part",
    (slug) => {
      const project = renderProject(slug);
      expect(gridCards().slice(0, 3)).toEqual([
        "Outcome",
        "My part",
        "Interface",
      ]);
      const outcome = screen.getByRole("article", { name: "Outcome" });
      const terms = within(outcome).getAllByRole("term");
      expect(terms.map((term) => term.textContent)).toEqual(
        project.outcomes!.map((o) => o.label),
      );
      expect(terms.map((term) => term.nextElementSibling?.textContent)).toEqual(
        project.outcomes!.map((o) => o.value),
      );
      // The figures are his own statement, so the card says where they are.
      expect(
        within(outcome).getByRole("link", {
          name: "As stated in the résumé →",
        }),
      ).toHaveAttribute("href", "/resume");
      expect(
        screen.getByRole("article", { name: "My part" }),
      ).toHaveTextContent(project.myPart!);
      // Each a full row: side by side, the longer text stretched the
      // figures' card and left it half empty.
      for (const card of [
        outcome,
        screen.getByRole("article", { name: "My part" }),
      ])
        expect(card.className).toMatch(
          /min-\[641px\]:col-span-2 lg:col-span-3/,
        );
    },
  );

  it("states the intranet's two figures and the pipeline's two", () => {
    renderProject("tbh-intranet");
    expect(screen.getByRole("article", { name: "Outcome" })).toHaveTextContent(
      "Adoption50+ employeesBuild cycles4 months to 1 week",
    );
    renderProject("ai-automation");
    expect(
      screen.getAllByRole("article", { name: "Outcome" })[1],
    ).toHaveTextContent(
      "Recurring workflow staffing10 people to 1 operatorTurnaround30 minutes",
    );
  });

  it.each(["node-validator-automation", "email-signature-generator"])(
    "gives %s his part on a full row, with no outcome it has no figure for",
    (slug) => {
      const project = renderProject(slug);
      expect(screen.queryByRole("article", { name: "Outcome" })).toBeNull();
      expect(screen.queryByText("As stated in the résumé →")).toBeNull();
      const part = screen.getByRole("article", { name: "My part" });
      expect(part).toHaveTextContent(project.myPart!);
      expect(part.className).toMatch(/lg:col-span-3/);
      expect(gridCards().slice(0, 2)).toEqual(["My part", "Interface"]);
    },
  );

  it("leaves both cards out for a project that states neither", () => {
    const {
      outcomes: _outcomes,
      myPart: _myPart,
      ...plain
    } = getPortfolioProjectBySlug("tbh-intranet")!;
    render(
      <ChromeProvider>
        <PortfolioProjectPage project={plain} />
      </ChromeProvider>,
    );
    expect(screen.queryByRole("article", { name: "Outcome" })).toBeNull();
    expect(screen.queryByRole("article", { name: "My part" })).toBeNull();
    expect(gridCards()[0]).toBe("Interface");
  });
});

describe("PortfolioIndexPage (the first outcome on each card)", () => {
  it("shows it under the tagline, only where the project states one", () => {
    renderIndex();
    for (const project of projects) {
      const card = screen.getByRole("article", { name: project.name });
      const lead = project.outcomes?.[0];
      const line = lead ? `${lead.label}: ${lead.value}` : null;
      const tagline = within(card).getByText(project.tagline);
      expect(tagline.nextElementSibling?.textContent ?? null).toBe(line);
    }
    expect(
      screen.getByRole("article", { name: "TBH Intranet" }),
    ).toHaveTextContent("Adoption: 50+ employees");
    expect(
      screen.getByRole("article", { name: "AI Automation" }),
    ).toHaveTextContent("Recurring workflow staffing: 10 people to 1 operator");
  });
});

describe("PortfolioProjectPage (where a hiring reader goes next)", () => {
  it.each([
    "tbh-intranet",
    "ai-automation",
    "node-validator-automation",
    "email-signature-generator",
  ])(
    "closes %s with the availability, the résumé and the hiring contact",
    (slug) => {
      renderProject(slug);
      const card = screen.getByRole("article", { name: "Hiring" });
      expect(within(card).getByRole("heading", { level: 3 })).toHaveTextContent(
        "Want work like this on your team?",
      );
      expect(card).toHaveTextContent(
        "Open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote.",
      );
      const resume = within(card).getByRole("link", { name: "Résumé" });
      expect(resume).toHaveAttribute("href", "/resume");
      expect(resume.className).toMatch(/bg-cta/);
      expect(
        within(card).getByRole("link", { name: "Contact" }),
      ).toHaveAttribute("href", "/contact?topic=hiring");
      // After the case study's cards, and not one of the grid's cells.
      expect(card.previousElementSibling?.className).toMatch(/(^| )bento( |$)/);
      expect(card.closest(".bento")).toBeNull();
    },
  );
});
