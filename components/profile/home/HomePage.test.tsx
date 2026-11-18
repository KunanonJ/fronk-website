import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "@/components/profile/home/HomePage";
import { withRouter } from "@/tests/routerContext";

/*
 * Home (Phase 6 cutover): the page's own <main id="main">, which the skip link
 * targets, one h1 (the smoke and axe tests need it) and the three labelled
 * Home sections the scrollspy and the anchors use, with GoGoCash's #ventures.
 */
describe("HomePage", () => {
  const html = renderToString(withRouter(<HomePage />));

  it("is the page's main landmark, which the skip link targets", () => {
    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html).toMatch(/<main id="main" tabindex="-1" class="pf-main/i);
  });

  it("keeps one h1: the hero's", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h1 id="hero-title"');
  });

  it("has the three labelled sections, in order, and #ventures on the GoGoCash card", () => {
    const ids = [
      // #work is an article (a smoke test reads its name "Selected work"). A
      // stack card carries an id too (GoGoCash's "ventures"), so only the
      // Home's sections are kept.
      ...html.matchAll(
        /<(?:section|article) id="([^"]+)" aria-labelledby="([^"]+)"/g,
      ),
    ].filter((m) => ["work", "about", "journey"].includes(m[1]!));
    expect(ids.map((m) => m[1])).toEqual(["work", "about", "journey"]);
    for (const [, id, labelledBy] of ids) {
      expect(html).toContain(`id="${labelledBy}"`);
      expect(id).toBeTruthy();
    }
    expect(html).toContain('id="ventures"');
  });

  it("links the cases at their live addresses, never under /preview", () => {
    expect(html).toContain('href="/portfolio/tbh-intranet"');
    expect(html).toContain('href="/ventures/gogocash"');
    expect(html).not.toContain("/preview");
  });
});
