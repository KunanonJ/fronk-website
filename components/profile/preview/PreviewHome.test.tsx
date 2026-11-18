import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PreviewHome from "@/components/profile/preview/PreviewHome";

/*
 * /preview: one h1 (the smoke and axe tests need it) and the three labelled
 * Home sections the scrollspy and the anchors use.
 */
describe("PreviewHome", () => {
  const html = renderToString(<PreviewHome />);

  it("keeps its h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Profile preview");
  });

  it("has the three labelled sections, in order", () => {
    const ids = [
      ...html.matchAll(/<section id="([^"]+)" aria-labelledby="([^"]+)"/g),
    ];
    expect(ids.map((m) => m[1])).toEqual(["work", "about", "journey"]);
    for (const [, id, labelledBy] of ids) {
      expect(html).toContain(`id="${labelledBy}"`);
      expect(id).toBeTruthy();
    }
  });
});
