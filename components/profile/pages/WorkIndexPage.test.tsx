import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkIndexPage from "@/components/profile/pages/WorkIndexPage";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import type { PortfolioFilter } from "@/lib/portfolio/search";

/*
 * /portfolio, "All work", after the Phase 6 cutover (plan step 6d): the same
 * intents as the bento index's tests it replaces (portfolio.test.tsx,
 * umbrella input R17), on lift cards: the h1 word for word, a card per
 * project named by it in list order, its link to the case, its first cleared
 * outcome, and the category filter.
 */

const projects = getAllPortfolioProjects();

function renderIndex(
  category: PortfolioFilter = "all",
  onCategoryChange = vi.fn(),
) {
  render(
    <WorkIndexPage category={category} onCategoryChange={onCategoryChange} />,
  );
  return onCategoryChange;
}

const cards = () =>
  screen
    .getAllByRole("article")
    .filter((card) => card.classList.contains("pf-work-card"));

describe("WorkIndexPage", () => {
  it("leads with the h1, word for word the live page's, its last line the accent", () => {
    renderIndex();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Selected work: internal tools, automations and AI agents.",
    );
    expect(h1.className).toMatch(/t-display/);
    const lines = h1.querySelectorAll(".pf-page-hero__line");
    expect(lines).toHaveLength(3);
    expect(lines[2]!.querySelector(".pf-page-hero__accent")).toHaveTextContent(
      "AI agents.",
    );
  });

  it("shows every project as a lift card named by it, in list order, linking its case", () => {
    renderIndex();
    expect(cards().map((card) => card.getAttribute("aria-labelledby"))).toEqual(
      projects.map((p) => `work-${p.slug}`),
    );
    for (const p of projects) {
      const card = screen.getByRole("article", { name: p.name });
      // One link, named by its visible label first (WCAG 2.5.3).
      const links = within(card).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName(`Read the case study: ${p.name}`);
      expect(links[0]).toHaveAttribute("href", `/portfolio/${p.slug}`);
      expect(card).toHaveTextContent(p.category);
      // A drawn picture says so; a real screenshot (this site) does not.
      expect(within(card).queryAllByText("Illustration")).toHaveLength(
        p.cover ? 0 : 1,
      );
    }
    expect(screen.getByText("5 of 5 projects")).toBeInTheDocument();
  });

  it("shows a project's registered screenshot as its cover, else the drawn picture", () => {
    // The base index's check (portfolio.test.tsx before the cutover; review
    // finding 8): the cover is the project's own image. On a lift card it is
    // decoration, since the card's title names the project: an empty alt
    // inside the mat, which screen readers skip.
    renderIndex();
    const withCover = projects.filter((p) => p.cover);
    expect(withCover.map((p) => p.slug)).toEqual(["kunanonj-com"]);
    for (const p of projects) {
      const card = screen.getByRole("article", { name: p.name });
      const mat = card.querySelector(".pf-lift__mat")!;
      expect(mat).toHaveAttribute("aria-hidden", "true");
      const shot = mat.querySelector("img.pf-case-art__shot");
      if (p.cover) {
        expect(shot, p.slug).toHaveAttribute("src", p.cover.src);
        expect(shot).toHaveAttribute("width", String(p.cover.width));
        expect(shot).toHaveAttribute("height", String(p.cover.height));
        expect(shot).toHaveAttribute("alt", "");
        expect(shot).toHaveAttribute("loading", "lazy");
        expect(mat).toHaveAttribute("data-kind", "screenshot");
        expect(mat.querySelector(".pf-case-art")).toBeNull();
      } else {
        expect(shot, p.slug).toBeNull();
        expect(mat).toHaveAttribute("data-kind", "illustration");
        expect(mat.querySelector(".pf-case-art")).not.toBeNull();
      }
    }
  });

  it("marks this site public and the employer's tools internal", () => {
    renderIndex();
    for (const project of projects) {
      expect(
        screen.getByRole("article", { name: project.name }),
      ).toHaveTextContent(
        project.access === "public" ? "Public" : "Internal tool",
      );
    }
    expect(
      projects.filter((p) => p.access === "public").map((p) => p.slug),
    ).toEqual(["kunanonj-com"]);
  });

  it("shows the first outcome under the tagline, only where the project states one", () => {
    renderIndex();
    for (const project of projects) {
      const card = screen.getByRole("article", { name: project.name });
      const lead = project.outcomes?.[0];
      const line = lead ? `${lead.label}: ${lead.value}` : null;
      const tagline = within(card).getByText(project.tagline);
      const next = tagline.nextElementSibling;
      expect(
        next?.classList.contains("pf-work-card__outcome")
          ? next.textContent
          : null,
      ).toBe(line);
    }
    expect(
      screen.getByRole("article", { name: "TBH Intranet" }),
    ).toHaveTextContent("Adoption: 50+ employees");
    expect(
      screen.getByRole("article", { name: "AI Automation" }),
    ).toHaveTextContent("Recurring workflow staffing: 10 people to 1 operator");
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

  it("narrows to one category and counts it", () => {
    renderIndex("ai-agents");
    expect(cards()).toHaveLength(1);
    expect(
      screen.getByRole("article", { name: "AI Automation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 5 projects")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI agents" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
