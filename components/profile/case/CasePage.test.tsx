import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CasePage from "@/components/profile/case/CasePage";
import { BLOG_PUBLIC, isBlogHref } from "@/lib/content/blogVisibility";
import {
  allCaseStudies,
  caseAccess,
  caseHeading,
  findProjectCase,
  findVentureCase,
} from "@/lib/content/caseStudy";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { extractPage } from "@/lib/parity/parity.mjs";
import { VENTURE_RELATED_TOPICS, getAllVentures } from "@/lib/content/ventures";
import parity from "@/tests/fixtures/site-parity.json";

/*
 * The case-study template (profile redesign Phase 5, design spec 9): what
 * each case prints, in which order, with which names, and that every field
 * of today's content reaches the page (plan step 5a's completeness check).
 */

const pages = parity as Record<string, { h1?: string }>;

function textOf(container: HTMLElement): string {
  return (container.textContent ?? "").replace(/\s+/g, " ");
}

describe("CasePage, the h1 (R12)", () => {
  it("prints the live page's h1 text for every case, as the parity gate reads it", () => {
    for (const study of allCaseStudies()) {
      const html = renderToString(<CasePage study={study} />);
      expect(extractPage(html).h1, study.path).toBe(pages[study.path]?.h1);
      expect(html.match(/<h1\b/g), study.path).toHaveLength(1);
    }
  });

  it("sets the name as the display line and the tagline as a line inside it", () => {
    render(<CasePage study={findVentureCase("gogocash")!} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "hero-title");
    expect(h1.closest("section")).toHaveAttribute(
      "aria-labelledby",
      "hero-title",
    );
    expect(h1.textContent).toBe(caseHeading(findVentureCase("gogocash")!));
    // The logo is decoration: its name is the h1's own words.
    expect(h1.querySelector("img")).toHaveAttribute("alt", "");
    expect(h1.querySelector(".pf-case-hero__tagline")).toHaveTextContent(
      "Shopping-to-earn cashback.",
    );
  });
});

describe("CasePage, every field of today's content reaches the page", () => {
  for (const project of getAllPortfolioProjects()) {
    it(`project ${project.slug}`, () => {
      const { container } = render(
        <CasePage study={findProjectCase(project.slug)!} />,
      );
      const text = textOf(container);
      for (const line of [
        project.name,
        project.tagline,
        project.summary,
        project.category,
        project.role,
        project.organization,
        project.period,
        caseAccess(project.access),
        ...project.stack,
        ...project.highlights,
        ...project.sections.flatMap((s) => [s.heading, s.body]),
        ...(project.beforeAfter
          ? [project.beforeAfter.before, project.beforeAfter.after]
          : []),
        ...(project.outcomes ?? []).flatMap((o) => [o.label, o.value]),
        ...(project.myPart ? [project.myPart] : []),
        ...(project.urlLabel ? [project.urlLabel] : []),
        ...(project.workflow
          ? [
              project.workflow.title,
              ...project.workflow.steps.flatMap((s) => [
                s.label,
                ...(s.detail ? [s.detail] : []),
              ]),
            ]
          : []),
        ...(project.architecture?.layers ?? []).flatMap((layer) => [
          layer.label,
          ...layer.nodes.flatMap((n) => [n.label, ...(n.note ? [n.note] : [])]),
        ]),
      ])
        expect(text, line).toContain(line);
      if (project.url) {
        expect(
          container.querySelector(`a[href="${project.url}"]`),
        ).not.toBeNull();
      }
      if (project.cover) {
        expect(
          screen.getByRole("img", { name: project.cover.alt }),
        ).toHaveAttribute("src", project.cover.src);
      }
    });
  }

  for (const venture of getAllVentures().filter((v) => v.caseStudy)) {
    it(`venture ${venture.slug}`, () => {
      const { container } = render(
        <CasePage study={findVentureCase(venture.slug)!} />,
      );
      const text = textOf(container);
      const caseStudy = venture.caseStudy!;
      for (const line of [
        venture.name,
        venture.tagline,
        venture.role,
        String(venture.year),
        venture.urlLabel,
        caseStudy.intro,
        caseStudy.timeline,
        ...caseStudy.sections.flatMap((s) => [s.heading, s.body]),
        ...(caseStudy.loop ?? []),
        ...venture.stack,
        ...(venture.offer ? [venture.offer.label] : []),
        ...(venture.metrics ?? []).flatMap((m) => [m.label, m.value]),
        ...(VENTURE_RELATED_TOPICS[venture.slug] ?? [])
          .filter((link) => BLOG_PUBLIC || !isBlogHref(link.href))
          .map((link) => link.label),
      ])
        expect(text, line).toContain(line);
      expect(
        container.querySelector(`a[href="${venture.url}"]`),
      ).not.toBeNull();
      expect(
        container.querySelector(`img[src="${venture.logo}"]`),
      ).not.toBeNull();
    });
  }
});

describe("CasePage, the evidence before the cover (spec 9.3)", () => {
  it("names the rows Outcome, My part and Interface, in that order", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const outcome = screen.getByRole("article", { name: "Outcome" });
    const part = screen.getByRole("article", { name: "My part" });
    const cover = screen.getByRole("article", { name: "Interface" });
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(outcome, part)).toBe(true);
    expect(follows(part, cover)).toBe(true);
    expect(
      within(outcome).getByRole("link", { name: "As stated in the résumé →" }),
    ).toHaveAttribute("href", "/resume");
    expect(outcome).toHaveTextContent("50+ employees");
    expect(part).toHaveTextContent("wrote code for the platform");
  });

  it("shows My part and no Outcome when no figure is cleared, and neither on the site's case", () => {
    const { unmount } = render(
      <CasePage study={findProjectCase("node-validator-automation")!} />,
    );
    expect(screen.queryByRole("article", { name: "Outcome" })).toBeNull();
    expect(screen.getByRole("article", { name: "My part" })).toBeVisible();
    unmount();
    render(<CasePage study={findProjectCase("kunanonj-com")!} />);
    expect(screen.queryByRole("article", { name: "Outcome" })).toBeNull();
    expect(screen.queryByRole("article", { name: "My part" })).toBeNull();
  });

  it("dates a venture's running totals inside their own dl item", () => {
    const { container } = render(
      <CasePage study={findVentureCase("gogocash")!} />,
    );
    const figures = screen.getByRole("article", { name: "Venture metrics" });
    for (const label of [
      "Cumulative gross merchandise value",
      "Cashback paid",
    ]) {
      const item = [...figures.querySelectorAll("dl > div")].find((div) =>
        div.textContent?.includes(label),
      );
      expect(item, label).toBeDefined();
      expect(item).toHaveTextContent("As of October 2026");
    }
    expect(screen.getByRole("article", { name: "My role" })).toHaveTextContent(
      "Founder.",
    );
    // Every count of registered users reads 1,000 (the claim audits' rule).
    const counts = [
      ...textOf(container).matchAll(/([\d,.]*\d\+?)\s+registered users/gi),
    ].map((m) => m[1]);
    expect(counts.length).toBeGreaterThan(1);
    expect(new Set(counts)).toEqual(new Set(["1,000"]));
  });
});

describe("CasePage, the cover (spec 9.4)", () => {
  it("captions a drawn cover as an illustration and names its picture", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const cover = screen.getByRole("article", { name: "Interface" });
    expect(within(cover).getByRole("img")).toHaveAccessibleName(
      "Illustrative mockup of TBH Intranet",
    );
    expect(cover.querySelector("figcaption")?.textContent).toMatch(
      /^Illustration/,
    );
    // Two drawings, one per width: no text under 12 units in either.
    for (const text of cover.querySelectorAll("text")) {
      expect(Number(text.getAttribute("font-size"))).toBeGreaterThanOrEqual(12);
    }
  });

  it("loads a screenshot cover at once, with its size, and no illustration caption", () => {
    render(<CasePage study={findProjectCase("kunanonj-com")!} />);
    const cover = screen.getByRole("article", { name: "Interface" });
    const img = within(cover).getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("width", "1440");
    expect(img).toHaveAttribute("height", "900");
    expect(img).toHaveAttribute("sizes", "(max-width: 1360px) 100vw, 1360px");
    expect(img).not.toHaveAttribute("fetchpriority");
    expect(cover.querySelector("figcaption")).toBeNull();
  });
});

describe("CasePage, the hero's links", () => {
  it("names the public source as a new tab, and keeps the byline", () => {
    render(<CasePage study={findProjectCase("kunanonj-com")!} />);
    const source = screen.getByRole("link", {
      name: "Source on GitHub (opens in a new tab)",
    });
    expect(source).toHaveAttribute(
      "href",
      "https://github.com/KunanonJ/fronk-website",
    );
    expect(source).toHaveAttribute("target", "_blank");
    expect(source.getAttribute("rel")).toContain("noopener");
    expect(screen.getByRole("link", { name: "Kunanon Jarat" })).toHaveAttribute(
      "rel",
      "author",
    );
    const hero = screen.getByRole("region", {
      name: caseHeading(findProjectCase("kunanonj-com")!),
    });
    expect(
      within(hero).getByRole("link", { name: "All projects" }),
    ).toHaveAttribute("href", "/portfolio");
  });

  it("gives only a public project a link out: no Visit or source link on an internal tool", () => {
    // The base project page's check ("gives no other project a public link",
    // portfolio.test.tsx before the cutover; review finding 8).
    const projects = getAllPortfolioProjects();
    expect(
      projects.filter((p) => p.access === "public").map((p) => p.slug),
    ).toEqual(["kunanonj-com"]);
    for (const project of projects) {
      const { container, unmount } = render(
        <CasePage study={findProjectCase(project.slug)!} />,
      );
      const out = container.querySelectorAll(".pf-case-actions__external");
      if (project.access === "public") {
        expect(out, project.slug).toHaveLength(1);
        expect(out[0]).toHaveAttribute("href", project.url);
      } else {
        expect(out, project.slug).toHaveLength(0);
        expect(
          screen.queryAllByRole("link", { name: /GitHub|Visit/ }),
          project.slug,
        ).toEqual([]);
        expect(
          container.querySelectorAll('.pf-case-hero a[target="_blank"]'),
          project.slug,
        ).toHaveLength(0);
      }
      unmount();
    }
  });

  it("gives a venture the byline that carries its live page's My role footer", () => {
    const ventures = getAllVentures().filter((venture) => venture.caseStudy);
    expect(ventures.length).toBeGreaterThan(0);
    for (const venture of ventures) {
      const { unmount } = render(
        <CasePage study={findVentureCase(venture.slug)!} />,
      );
      const author = screen.getByRole("link", { name: "Kunanon Jarat" });
      expect(author, venture.slug).toHaveAttribute("href", "/about");
      expect(author, venture.slug).toHaveAttribute("rel", "author");
      expect(author.closest("p")?.textContent, venture.slug).toBe(
        `By Kunanon Jarat · ${venture.role}`,
      );
      unmount();
    }
  });

  it("opens the share panel from the reused Share pill, and Escape closes it", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const share = screen.getByRole("button", { name: "Share" });
    expect(share).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(share);
    expect(share).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("region", { name: "Share this page" }),
    ).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("region", { name: "Share this page" }),
    ).toBeNull();
    expect(share).toHaveFocus();
  });

  it("closes the share panel on a press outside its row", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.pointerDown(screen.getByRole("heading", { level: 1 }));
    expect(
      screen.queryByRole("region", { name: "Share this page" }),
    ).toBeNull();
  });

  it("closes the share panel when focus leaves its row, and leaves focus where it went (WCAG 2.4.11)", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    const panel = screen.getByRole("region", { name: "Share this page" });
    const row = within(panel).getAllByRole("button")[0]!;
    // Inside the row (the panel's rows and the pill), it stays open.
    fireEvent.blur(row, {
      relatedTarget: screen.getByRole("button", { name: "Share" }),
    });
    expect(screen.getByRole("region", { name: "Share this page" })).toBe(panel);
    // Focus going nowhere (another window, the share sheet) keeps it open.
    fireEvent.blur(row, { relatedTarget: null });
    expect(
      screen.getByRole("region", { name: "Share this page" }),
    ).toBeInTheDocument();
    // Tab past the panel, to the link under it: it closes.
    const next = screen.getByRole("link", {
      name: "As stated in the résumé →",
    });
    next.focus();
    fireEvent.blur(row, { relatedTarget: next });
    expect(
      screen.queryByRole("region", { name: "Share this page" }),
    ).toBeNull();
    expect(next).toHaveFocus();
  });
});

describe("CasePage, the contents (spec 9.6)", () => {
  let scrolled: Element[] = [];
  beforeEach(() => {
    scrolled = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this);
    };
  });
  afterEach(() => {
    // jsdom has no scrollIntoView of its own.
    delete (Element.prototype as Partial<Element>).scrollIntoView;
    window.history.replaceState(null, "", "/");
  });

  it("lists the chapters in the rail and in the phone disclosure", () => {
    const study = findProjectCase("tbh-intranet")!;
    render(<CasePage study={study} />);
    const navs = screen.getAllByRole("navigation", { name: "On this page" });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      const links = within(nav).getAllByRole("link");
      expect(links.map((link) => link.textContent)).toEqual(
        study.chapters.map((c) => `${c.number}${c.title}`),
      );
      expect(links.map((link) => link.getAttribute("href"))).toEqual(
        study.chapters.map((c) => `#${c.id}`),
      );
    }
    // The phone disclosure comes first, after the meta row; it starts closed.
    expect(navs[0]!.querySelector("details")).not.toHaveAttribute("open");
    expect(navs[1]!.querySelector("details")).toBeNull();
  });

  it("names each chapter's h2 by its title, the number being decoration", () => {
    const study = findProjectCase("tbh-intranet")!;
    render(<CasePage study={study} />);
    for (const chapter of study.chapters) {
      const section = document.getElementById(chapter.id)!;
      expect(section.tagName).toBe("SECTION");
      expect(
        within(section).getAllByRole("heading", { level: 2 })[0],
      ).toHaveAccessibleName(chapter.title);
    }
  });

  it("moves to a chapter on a click: scrolls it in, replaces the hash, marks it, focuses it", () => {
    const pushes = vi.spyOn(window.history, "pushState");
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const [, rail] = screen.getAllByRole("navigation", {
      name: "On this page",
    });
    const link = within(rail!).getByRole("link", { name: "Architecture" });
    const followed = fireEvent.click(link);
    expect(followed).toBe(false); // default prevented: no browser jump
    const target = document.getElementById("ch-04")!;
    expect(scrolled).toEqual([target]);
    expect(window.location.hash).toBe("#ch-04");
    expect(pushes).not.toHaveBeenCalled();
    expect(link).toHaveAttribute("aria-current", "location");
    expect(target).toHaveFocus();
    pushes.mockRestore();
  });

  it("closes the phone disclosure when one of its links is followed", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const [phone] = screen.getAllByRole("navigation", {
      name: "On this page",
    });
    const details = phone!.querySelector("details")!;
    details.open = true;
    fireEvent.click(within(phone!).getByRole("link", { name: "Tech stack" }));
    expect(details.open).toBe(false);
  });

  it("leaves a modified click to the browser", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const [, rail] = screen.getAllByRole("navigation", {
      name: "On this page",
    });
    const followed = fireEvent.click(
      within(rail!).getByRole("link", { name: "Tech stack" }),
      { ctrlKey: true },
    );
    expect(followed).toBe(true);
    expect(scrolled).toEqual([]);
  });
});

describe("CasePage, the end of the page (spec 9.11, 9.12)", () => {
  it("ends the column with the Hiring panel and its two links", () => {
    render(<CasePage study={findProjectCase("tbh-intranet")!} />);
    const hire = screen.getByRole("article", { name: "Hiring" });
    expect(hire).toHaveTextContent("Want work like this on your team?");
    expect(hire).toHaveTextContent(
      "Open to Forward Deployed Engineer and AI engineering roles",
    );
    expect(within(hire).getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    expect(within(hire).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=hiring",
    );
  });

  it("offers two more cases as cards whose one link names the case", () => {
    const study = findVentureCase("manut")!;
    render(<CasePage study={study} />);
    const more = screen.getByRole("region", { name: "More projects" });
    const cards = within(more).getAllByRole("article");
    expect(cards.map((card) => card.getAttribute("aria-labelledby"))).toEqual(
      study.more.map((card) => `more-${card.slug}`),
    );
    for (const card of study.more) {
      expect(
        within(more).getByRole("link", {
          name: `Read the case study: ${card.name}`,
        }),
      ).toHaveAttribute("href", card.href);
    }
    expect(
      within(more).getByRole("link", { name: "All projects" }),
    ).toHaveAttribute("href", "/portfolio");
  });
});
