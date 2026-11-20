import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import ResumePage from "@/components/resume/ResumePage";
import { AVAILABILITY } from "@/lib/content/identity";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import type { ResumeDetail } from "@/lib/resume/search";

const profile = resolveResumeProfile(null);

function renderPage(detail: ResumeDetail = "detailed") {
  const onDetailChange = vi.fn();
  const utils = render(
    <ChromeProvider>
      <ResumePage
        profile={profile}
        detail={detail}
        onDetailChange={onDetailChange}
      />
    </ChromeProvider>,
  );
  return { ...utils, onDetailChange };
}

describe("ResumePage (screen)", () => {
  it("leads with the h1 built from the name and headline, in the new hero", () => {
    renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Kunanon Jarat. Solopreneur. Builds AI tools inside the businesses that use them. Based in Bangkok.",
    );
    // The display serif on the pixel sky (Phase 7e), one line per block.
    expect(h1).toHaveClass("t-display");
    expect(h1.closest("section")).toHaveClass("pf-page-hero");
    expect(h1.children).toHaveLength(3);
  });

  it("states the summary and the availability under the h1", () => {
    renderPage();
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
    expect(
      screen.getByText(AVAILABILITY.pill.label, { exact: false }).closest("p"),
    ).toHaveTextContent(
      `${AVAILABILITY.pill.label} · ${AVAILABILITY.pill.detail}`,
    );
  });

  it("offers the PDF under a findable name, Contact, Share and the detail control", () => {
    const { onDetailChange } = renderPage();
    for (const link of screen.getAllByRole("link", { name: "Download PDF" })) {
      expect(link).toHaveAttribute("href", "/resume.pdf");
      expect(link).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    }
    // Contact opens the form with Freelance or consulting already chosen.
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=project",
    );
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute(
      "data-panel-trigger",
    );
    const group = screen.getByRole("group", { name: "Résumé detail" });
    expect(
      within(group).getByRole("button", { name: "Detailed" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(group).getByRole("button", { name: "Compact" }));
    expect(onDetailChange).toHaveBeenCalledWith("compact");
  });

  it("draws every section as a labelled card", () => {
    renderPage();
    for (const section of profile.sections)
      expect(
        screen.getByRole("article", { name: section.title }),
      ).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Share" })).toBeInTheDocument();
  });

  it("keeps Currently to the two ventures he is building, each with its case study", () => {
    renderPage();
    const current = screen.getByRole("article", { name: "Currently" });
    expect(
      within(current)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["GoGoCash", "Manut AI"]);
    expect(current).not.toHaveTextContent("IT Manager & AI Engineering Lead");
    // Each venture's "Case study" is named after it for screen readers.
    expect(
      within(current).getByRole("link", { name: "Case study: GoGoCash" }),
    ).toHaveAttribute("href", "/ventures/gogocash");
    expect(
      within(current).getByRole("link", { name: "Case study: Manut AI" }),
    ).toHaveAttribute("href", "/ventures/manut");
  });

  it("leads Experience with the latest role, ended, and links its case studies", () => {
    renderPage();
    const card = screen.getByRole("article", { name: "Experience" });
    const first = card.querySelector("li")!;
    expect(first).toHaveTextContent("IT Manager & AI Engineering Lead");
    expect(first).toHaveTextContent("Sep 2025 — Nov 2026");
    expect(card).not.toHaveTextContent("Present");
    // The arrow stays on screen but out of the link's name (spec 12 item 18).
    expect(
      within(first).getByRole("link", { name: "Case studies" }),
    ).toHaveAttribute("href", "/portfolio");
    expect(first).toHaveTextContent("Case studies→");
  });

  it("numbers Experience across two columns of about equal height", () => {
    renderPage();
    const card = screen.getByRole("article", { name: "Experience" });
    const columns = card.querySelectorAll("ol");
    expect(columns).toHaveLength(2);
    // Four long roles balance six short ones: the split follows height, not count.
    expect(columns[0]!.children).toHaveLength(4);
    expect(columns[1]!.children).toHaveLength(6);
    expect(columns[1]).toHaveAttribute("start", "5");
    expect(card.textContent).toContain("01");
    expect(card.textContent).toContain("10");
  });

  it("explains a role that overlapped another, in both detail levels", () => {
    const note =
      "Concurrent with The Binary Holdings during Sep 2025 to Oct 2025.";
    const { unmount } = renderPage();
    expect(screen.getByText(note)).toBeInTheDocument();
    unmount();
    renderPage("compact");
    expect(screen.getByText(note)).toBeInTheDocument();
  });

  it("marks each card with its kind, which places it in the grid", () => {
    // pages-catalog.css: University-era spans the row from 600 px and sits
    // beside Education and Affiliations from 1024 px (profile-pages-catalog
    // spec measures it in the browser).
    renderPage();
    const kind = (name: string) =>
      screen.getByRole("article", { name }).getAttribute("data-kind");
    expect(kind("University-era")).toBe("early");
    expect(kind("Education")).toBe("education");
    expect(kind("Experience")).toBe("roles");
    expect(kind("Skills")).toBe("skills");
  });

  it("lists the live ventures under Currently with the Ember square, and GoSpark under Independent projects", () => {
    const { container } = renderPage();
    const current = screen.getByRole("article", { name: "Currently" });
    const projects = screen.getByRole("article", {
      name: "Independent projects",
    });
    expect(
      within(projects)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["GoSpark"]);
    expect(
      within(current).getByText("Live at gogocash.co."),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("li > .pf-resume__live").length).toBe(2);
    expect(
      within(current).getByRole("link", { name: "gogocash.co" }),
    ).toHaveAttribute("href", "https://gogocash.co");
  });

  it("groups the skills under the CV's four labels, AI first", () => {
    renderPage();
    const skills = screen.getByRole("article", { name: "Skills" });
    expect(
      within(skills)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual([
      "AI & Cloud",
      "Transformation & Delivery",
      "Engineering",
      "Tools",
    ]);
    expect(within(skills).getByText("Google ADK")).toBeInTheDocument();
    // Listed as the CV lists it (owner, 11-11-26).
    expect(within(skills).getByText("RAG")).toBeInTheDocument();
  });

  it("hides the bullet lists in the compact view", () => {
    renderPage("compact");
    expect(screen.queryByText("Live at gogocash.co.")).toBeNull();
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Roles, periods and skills stay.
    expect(screen.getByText("AI Project Manager")).toBeInTheDocument();
    expect(screen.getByText("AI agents")).toBeInTheDocument();
  });

  it("shares the canonical URL under the page title", () => {
    renderPage();
    const share = screen.getByRole("article", { name: "Share" });
    expect(share).toHaveTextContent("Resume — Fronk Kunanon Jarat");
    const x = within(share).getByRole("link", { name: "Post on X" });
    expect(x.getAttribute("href")).toContain(
      encodeURIComponent("Resume — Fronk Kunanon Jarat"),
    );
    expect(x.getAttribute("href")).toMatch(
      /url=https?%3A%2F%2F[^&]+%2Fresume$/,
    );
  });

  it("hides both screen parts in print", () => {
    const { container } = renderPage();
    expect(container.children).toHaveLength(2);
    for (const part of container.children)
      expect(part).toHaveAttribute("data-print-hide");
  });
});
