import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SiteFooter from "@/components/profile/site/SiteFooter";
import { footerCopy } from "@/lib/content/profileChrome";

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
    expect(html).toContain("Open to roles");
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
});
