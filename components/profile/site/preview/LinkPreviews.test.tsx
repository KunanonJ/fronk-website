import { describe, expect, it } from "vitest";
import { PREVIEW_LINKS } from "@/components/profile/site/preview/LinkPreviews";

/*
 * Which links preview (premium interactions, item 6): a case study's text
 * links only. The cards that open a case show it already.
 */
function link(html: string): HTMLAnchorElement {
  const box = document.createElement("div");
  box.innerHTML = html;
  return box.querySelector("a")!;
}

describe("PREVIEW_LINKS", () => {
  it("matches a case's prose, text and hub links", () => {
    for (const html of [
      '<a class="ds-prose-link" href="/portfolio/tbh-intranet">TBH</a>',
      '<a class="ds-text-link" href="/ventures/gogocash">GoGoCash</a>',
      '<a class="pf-hub-links__link" href="/ventures/manut">Manut</a>',
    ]) {
      expect(link(html).matches(PREVIEW_LINKS), html).toBe(true);
    }
  });

  it("leaves cards, other pages and other kinds of link alone", () => {
    for (const html of [
      '<a class="ds-stretch pf-lift__link" href="/portfolio/tbh-intranet">Read</a>',
      '<a class="ds-tile" href="/portfolio/tbh-intranet">Tile</a>',
      '<a class="ds-prose-link" href="/topics/ai-transformation-thailand">Hub</a>',
      '<a class="ds-text-link" href="/portfolio">All projects</a>',
    ]) {
      expect(link(html).matches(PREVIEW_LINKS), html).toBe(false);
    }
  });
});
