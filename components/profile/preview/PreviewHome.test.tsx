import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PreviewHome from "@/components/profile/preview/PreviewHome";
import { withRouter } from "@/tests/routerContext";

/*
 * /preview: one h1 (the smoke and axe tests need it) and the three labelled
 * Home sections the scrollspy and the anchors use.
 */
describe("PreviewHome", () => {
  const html = renderToString(withRouter(<PreviewHome />));

  it("keeps one h1: the hero's (Phase 2)", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h1 id="hero-title"');
  });

  it("has the three labelled sections, in order", () => {
    const ids = [
      // #work is an article since Phase 3 (a smoke test reads its name). A
      // stack card can carry an id too (GoGoCash's "ventures"), so only the
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
  });
});
