import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import SiteFooter from "@/components/profile/site/SiteFooter";
import { footerCopy, nowLine } from "@/lib/content/profileChrome";

/*
 * The footer (design spec 7.7): every page the old menu linked is in the server
 * HTML, so the crawl path survives without script.
 */

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

function navBlock(html: string, label: string): string {
  const start = html.indexOf(`aria-label="${label}"`);
  expect(start, label).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</nav>", start));
}

describe("SiteFooter", () => {
  const html = renderToString(<SiteFooter />);

  it("is the chrome footer, in English", () => {
    expect(html).toMatch(/<footer[^>]*data-site-chrome="true"[^>]*lang="en"/);
  });

  it("lists the thirteen pages of the old menu under Pages", () => {
    const pages = navBlock(html, "Pages");
    expect(pages.match(/<a /g)).toHaveLength(13);
    for (const href of [
      "/",
      "/about",
      "/portfolio",
      "/resume",
      "/skills",
      "/contact",
      "/learn",
      "/build",
    ]) {
      expect(pages).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('href="/blog"');
    expect(html).not.toContain('href="/press"');
  });

  it("lists the agent files and the three public profiles, opening the last two in a new tab", () => {
    const agents = navBlock(html, "For agents");
    expect(agents.match(/<a /g)).toHaveLength(4);
    const elsewhere = navBlock(html, "Elsewhere");
    expect(elsewhere.match(/<a /g)).toHaveLength(3);
    expect(elsewhere).toContain('target="_blank"');
    expect(elsewhere).toContain('rel="noopener"');
    expect(elsewhere).toContain("(opens in a new tab)");
  });

  it("carries the availability, the place and the draft copy", () => {
    expect(html).toContain("Currently building");
    expect(html).toContain(nowLine.doing);
    expect(html).not.toMatch(/open to roles/i);
    expect(html).toContain("Bangkok, GMT+7");
    expect(html).toContain(footerCopy.headline);
    for (const paragraph of footerCopy.paragraphs) {
      expect(html).toContain(paragraph.slice(0, 20));
    }
    expect(html).toMatch(/© \d{4} Kunanon Jarat · Bangkok/);
  });

  it("opens Say hello above its trigger, from the footer", () => {
    expect(html).toMatch(/popovertarget="say-hello-footer"/i);
    expect(html).toContain('id="say-hello-footer"');
  });

  it("draws none of the living status: no guess, no ship log, no time", () => {
    expect(html).not.toContain("pf-footer__guess");
    expect(html).not.toContain("pf-footer__shipped");
    expect(html).not.toContain("data-clock");
    expect(html).not.toMatch(/probably|Shipped/);
  });
});

/*
 * The living status (now-building-and-genz Phase 5): once the page runs,
 * the lazy chunk puts the hour's guess beside the clock.
 */
describe("SiteFooter, the living status", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("guesses beside the Bangkok clock once the page runs", async () => {
    // The ship log's request never answers here.
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    vi.useFakeTimers({ toFake: ["Date"] });
    // 05:30 UTC is 12:30 in Bangkok.
    vi.setSystemTime(new Date("2026-11-20T05:30:00Z"));
    render(<SiteFooter />);
    const guess = await screen.findByText("probably at lunch");
    expect(guess).toHaveClass("pf-footer__guess");
    const place = guess.closest("p")!;
    expect(place).toHaveTextContent(/^Bangkok, GMT\+7/);
    // After the clock, in the same line.
    const clock = place.querySelector("time[data-clock]")!;
    expect(clock).toHaveTextContent("12:30");
    expect(
      clock.compareDocumentPosition(guess) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

/*
 * What the bento footer's test checked (components/bento/primitives.test.tsx
 * before the Phase 6 cutover; review finding 7), on the rendered footer: each
 * public profile by its name, the agent files in their order, and no link to
 * a hidden page, under any address that starts with it.
 */
describe("SiteFooter, its links", () => {
  it("links each public profile by its name, in a new tab", () => {
    render(<SiteFooter />);
    const elsewhere = screen.getByRole("navigation", { name: "Elsewhere" });
    for (const [name, href] of [
      ["X", "https://x.com/fkj98"],
      ["LinkedIn", "https://www.linkedin.com/in/kunanonj"],
      ["GitHub", "https://github.com/KunanonJ"],
    ] as const) {
      const link = within(elsewhere).getByRole("link", {
        name: `${name} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
    expect(within(elsewhere).getAllByRole("link")).toHaveLength(3);
  });

  it("lists the four agent files, in order", () => {
    render(<SiteFooter />);
    const agents = screen.getByRole("navigation", { name: "For agents" });
    expect(
      within(agents)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/agents.md", "/llms.txt", "/sitemap.md", "/skills.md"]);
  });

  it("links no hidden page: no address under /blog or /press", () => {
    const { container } = render(<SiteFooter />);
    const hrefs = [...container.querySelectorAll("a[href]")].map((a) =>
      a.getAttribute("href")!,
    );
    // Every list was rendered: the pages, the agent files and the profiles.
    expect(hrefs.length).toBeGreaterThanOrEqual(20);
    expect(hrefs.filter((href) => /^\/(blog|press)/.test(href))).toEqual([]);
  });
});
