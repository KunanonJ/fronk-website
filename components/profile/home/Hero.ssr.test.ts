import { createElement, forwardRef, type AnchorHTMLAttributes } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Hero from "@/components/profile/home/Hero";
import { canvasMock, homeHero, logoStrip } from "@/lib/content/home";
import { extractPage } from "@/lib/parity/parity.mjs";
import parity from "@/tests/fixtures/site-parity.json";

/*
 * The hero as the server sends it (profile redesign, Phase 2; design spec
 * 5.6, 8.1 and 13 item 8). This runs in Node, where the server's own render
 * runs: the inline intro script is there, the h1 reads as the live Home's,
 * nothing moves, and no alternate phrase leaks into the HTML.
 */

vi.mock("@/components/navigation/Link", () => ({
  default: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >(function Link(props, ref) {
    return createElement("a", { ...props, ref });
  }),
}));

const html = renderToString(createElement(Hero));

describe("Hero, server HTML", () => {
  it("keeps the live Home's h1 text, as the parity gate reads it", () => {
    const live = (parity as Record<string, { h1?: string }>)["/"]?.h1;
    expect(extractPage(html).h1).toBe(live);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(`aria-label="${homeHero.title}"`);
  });

  it("starts the section with the intro script, so it runs before the hero paints", () => {
    const section = html.indexOf('<section class="pf-hero"');
    expect(section).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("<script>", section)).toBe(
      html.indexOf(">", section) + 1,
    );
    expect(html).toContain('"data-intro","pending"');
    expect(html).toContain("document.currentScript.remove()");
  });

  it("is still: no stamp, no leaving line, no running marquee, no pause control", () => {
    expect(html).not.toContain("data-stamp");
    expect(html).not.toContain("pf-hero__out");
    expect(html).not.toContain("data-running");
    expect(html).not.toContain("Pause motion");
  });

  it("carries the recruiter facts and every frame link and wordmark", () => {
    expect(html).toContain(homeHero.badge);
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="/resume"');
    for (const frame of canvasMock.frames) {
      expect(html).toContain(`href="${frame.href}"`);
      expect(html).toContain(
        `aria-label="${canvasMock.frameName(frame.name)}"`,
      );
    }
    for (const name of logoStrip.names) expect(html).toContain(name);
  });
});
