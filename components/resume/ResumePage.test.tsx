import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import ResumePage from "@/components/resume/ResumePage";
import { AVAILABILITY } from "@/lib/content/identity";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import { siteConfig } from "@/lib/site";

vi.mock("@/lib/utils/clipboard", () => ({
  writeClipboard: vi.fn(() => Promise.resolve(true)),
}));
// Vitest resolves a `?url` import to an empty string; the build's is hashed.
vi.mock("@/src/styles/resume.css?url", () => ({
  default: "/assets/resume.css",
}));

const profile = resolveResumeProfile(null);

function renderPage(view = profile) {
  return render(
    <ChromeProvider>
      <ResumePage profile={view} />
    </ChromeProvider>,
  );
}

/** The facts card beside the h1 (a labelled section, not a landmark). */
const snapshot = () =>
  screen
    .getByRole("heading", { level: 2, name: "At a glance" })
    .closest("section")!;

describe("ResumePage (screen)", () => {
  it("leads with the h1 built from the name and headline, smaller, in the hero", () => {
    renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    // Word for word what the parity reference pins.
    expect(h1).toHaveTextContent(
      "Kunanon Jarat. Solopreneur. Builds AI tools inside the businesses that use them. Based in Bangkok.",
    );
    expect(h1).toHaveClass("t-display", "pf-resume__title");
    expect(h1.closest("section")).toHaveClass("pf-page-hero", "pf-resume-hero");
    expect(h1.children).toHaveLength(3);
  });

  it("states the availability under the h1, then the card, then the summary", () => {
    const { container } = renderPage();
    const availability = screen
      .getByText(AVAILABILITY.pill.label, { exact: false })
      .closest("p")!;
    expect(availability).toHaveTextContent(
      `${AVAILABILITY.pill.label} · ${AVAILABILITY.pill.detail}`,
    );
    const summary = screen.getByText(profile.summary);
    // DOM order is the phone's order: Download PDF is on the first screen.
    const order = [
      screen.getByRole("heading", { level: 1 }),
      availability,
      snapshot(),
      summary,
    ];
    for (let i = 1; i < order.length; i += 1)
      expect(
        order[i - 1]!.compareDocumentPosition(order[i]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    // The card is the hero's aside, the summary comes after it.
    expect(snapshot().parentElement).toHaveClass("pf-page-hero__aside");
    expect(summary.parentElement).toHaveClass("pf-page-hero__after");
    expect(container.querySelector(".pf-page-hero--after")).not.toBeNull();
  });

  it("offers the PDF under a findable name and Contact in the facts card", () => {
    renderPage();
    const card = snapshot();
    const pdf = within(card).getByRole("link", { name: "Download PDF" });
    expect(pdf).toHaveAttribute("href", "/resume.pdf");
    expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    // The primary pill: the dark one.
    expect(pdf).toHaveClass("ds-pill", "ds-pill--lg");
    expect(pdf).not.toHaveClass("ds-pill--ghost");
    // Contact opens the form with Freelance or consulting already chosen.
    expect(within(card).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=project",
    );
    for (const link of screen.getAllByRole("link", { name: "Download PDF" })) {
      expect(link).toHaveAttribute("href", "/resume.pdf");
      expect(link).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    }
    // The pixel portrait is decoration.
    expect(card.querySelector("svg.pf-portrait")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("lists what he is building, where he is and how to reach him", () => {
    renderPage();
    const card = snapshot();
    const terms = [...card.querySelectorAll("dt")].map((dt) => dt.textContent);
    expect(terms).toEqual(["Building", "Based", "Contact"]);
    // The ventures come from the "Currently" section, each with its logo,
    // linked to its page.
    expect(
      within(card).getByRole("link", { name: "GoGoCash" }),
    ).toHaveAttribute("href", "/ventures/gogocash");
    expect(
      within(card).getByRole("link", { name: "Manut AI" }),
    ).toHaveAttribute("href", "/ventures/manut");
    expect(card.querySelectorAll('[data-logo="image"] img')).toHaveLength(2);
    expect(card).toHaveTextContent("Bangkok · GMT+7");
    expect(
      within(card).getByRole("link", { name: siteConfig.email }),
    ).toHaveAttribute("href", `mailto:${siteConfig.email}`);
    for (const [name, href] of [
      ["LinkedIn", siteConfig.socials.linkedin],
      ["GitHub", siteConfig.socials.github],
    ] as const) {
      const link = within(card).getByRole("link", {
        name: `${name} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("copies the address and says so politely", async () => {
    renderPage();
    const card = snapshot();
    const status = within(card).getByRole("status");
    expect(status).toHaveTextContent("");
    fireEvent.click(within(card).getByRole("button", { name: "Copy email" }));
    await waitFor(() => expect(status).toHaveTextContent("Email copied"));
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("drops the Building row and the tiles when the résumé has no Currently section", () => {
    renderPage({
      ...profile,
      sections: profile.sections.filter((s) => s.title !== "Currently"),
    });
    const terms = [...snapshot().querySelectorAll("dt")].map(
      (dt) => dt.textContent,
    );
    expect(terms).toEqual(["Based", "Contact"]);
    expect(screen.queryByRole("article", { name: "Building now" })).toBeNull();
    expect(screen.getByRole("article", { name: "Experience" })).toBeVisible();
  });

  it("orders the sections for a recruiter: building now, the roles, projects, skills, education and training, then share", () => {
    renderPage();
    const names = screen
      .getAllByRole("article")
      .filter((article) => !article.closest("details"))
      .map((article) =>
        article.getAttribute("aria-labelledby")
          ? document.getElementById(article.getAttribute("aria-labelledby")!)
              ?.textContent
          : null,
      );
    expect(names).toEqual([
      "Building now",
      "Experience",
      "Independent projects",
      "Skills",
      "Education",
      "Training",
      "Share",
    ]);
  });

  it("draws Building now as tiles: logo, period, live, one line and the links", () => {
    renderPage();
    const now = screen.getByRole("article", { name: "Building now" });
    const tiles = within(now).getAllByRole("listitem");
    expect(
      within(now)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["GoGoCash", "Manut AI"]);
    expect(now).not.toHaveTextContent("IT Manager & AI Engineering Lead");
    expect(tiles[0]).toHaveTextContent("May 2023 — Present");
    expect(tiles[0]).toHaveTextContent("Live");
    expect(tiles[0]).toHaveTextContent(
      "Thailand-focused platform helping shoppers earn cashback",
    );
    expect(tiles[1]).toHaveTextContent(
      "Building an ERP/CRM workspace with Intelligence AI for automotive SMEs.",
    );
    expect(tiles.every((tile) => tile.querySelector("[data-logo]"))).toBe(true);
    // Each venture's "Case study" is named after it for screen readers.
    expect(
      within(now).getByRole("link", { name: "Case study: GoGoCash" }),
    ).toHaveAttribute("href", "/ventures/gogocash");
    expect(
      within(now).getByRole("link", { name: "Case study: Manut AI" }),
    ).toHaveAttribute("href", "/ventures/manut");
    expect(
      within(now).getByRole("link", {
        name: "gogocash.co (opens in a new tab)",
      }),
    ).toHaveAttribute("href", "https://gogocash.co");
  });

  it("draws Experience as one timeline, latest first, with readable periods", () => {
    renderPage();
    const card = screen.getByRole("article", { name: "Experience" });
    const lists = card.querySelectorAll("ol");
    expect(lists).toHaveLength(1);
    expect(lists[0]).toHaveClass("pf-resume__timeline");
    expect(lists[0]!.children).toHaveLength(10);
    const first = lists[0]!.children[0]!;
    expect(first).toHaveTextContent("IT Manager & AI Engineering Lead");
    const when = first.querySelector(".pf-resume__when")!;
    expect(when).toHaveTextContent("Sep 2025 — Nov 2026");
    // Text, not the 12 px uppercase mono label.
    expect(when).not.toHaveClass("t-meta");
    expect(card).not.toHaveTextContent("Present");
    // The arrow stays on screen but out of the link's name (spec 12 item 18).
    expect(
      within(first as HTMLElement).getByRole("link", { name: "Case studies" }),
    ).toHaveAttribute("href", "/portfolio");
    // The role's heading comes before its period, for heading navigation.
    expect(
      first.querySelector("h3")!.compareDocumentPosition(when) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("explains a role that overlapped another", () => {
    renderPage();
    expect(
      screen.getByText(
        "Concurrent with The Binary Holdings during Sep 2025 to Oct 2025.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the live squares on the live bullets of the roles it lists", () => {
    const { container } = renderPage();
    // The tiles carry the live badge; the "Live at" bullets are not repeated.
    expect(container.querySelectorAll(".pf-resume__badge")).toHaveLength(2);
    expect(screen.queryByText("Live at gogocash.co.")).toBeNull();
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

  it("folds University-era and Affiliations into one closed details", () => {
    const { container } = renderPage();
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(1);
    const fold = details[0]!;
    expect(fold).not.toHaveAttribute("open");
    const summary = fold.querySelector("summary")!;
    expect(summary).toHaveTextContent("University-era and Affiliations");
    expect(summary).toHaveTextContent("8 entries");
    expect([...fold.querySelectorAll("h2")].map((h) => h.textContent)).toEqual([
      "University-era",
      "Affiliations",
    ]);
    expect(fold).toHaveTextContent("President & Co-Producer");
    expect(fold).toHaveTextContent("Protocol Camp");
  });

  it("keeps a heading order with no skipped level", () => {
    const { container } = renderPage();
    const levels = [...container.querySelectorAll("h1, h2, h3, h4")].map((h) =>
      Number(h.tagName[1]),
    );
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1)
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
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

  it("links its own stylesheet and hides both screen parts in print", () => {
    const { container } = renderPage();
    expect(
      document.head.querySelector(
        'link[rel="stylesheet"][data-precedence="pf-resume"]',
      ),
    ).toHaveAttribute("href", "/assets/resume.css");
    expect(container.children).toHaveLength(2);
    for (const part of container.children)
      expect(part).toHaveAttribute("data-print-hide");
  });
});
