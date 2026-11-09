import { describe, expect, it } from "vitest";
import {
  diffRecord,
  extractPage,
  headTags,
  internalLinks,
  normaliseBody,
  normaliseUrl,
  parseAttributes,
} from "./parity.mjs";

const NEXT_HTML = `<!DOCTYPE html><html lang="en" class="x"><head>
<meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="preload" href="/_next/static/media/font.woff2" as="font"/>
<link rel="stylesheet" href="/_next/static/css/app.css"/>
<meta name="next-size-adjust" content=""/>
<title>About Kunanon Jarat &amp; friends</title>
<meta property="og:image" content="https://kunanonj.com/opengraph-image-1a2b?abc123"/>
<link rel="canonical" href="https://kunanonj.com/about"/>
<link rel="icon" href="/icon?e3f" type="image/png" sizes="64x64"/>
</head><body><main id="main" lang="th"><h1>Hello <span>there</span></h1></main>
<script type="application/ld+json">{"@type":"Person","name":"K"}</script>
<a href="/skills">Skills</a><a href="/api/contact">x</a><a href="/about/">a</a>
<a href="/resume.pdf">pdf</a><a href="/blog#top">b</a><a href="https://x.com">x</a>
</body></html>`;

// The same page as a different framework would emit it: other order, other
// asset paths, lower-case charset, a different OG hash.
const START_HTML = `<!DOCTYPE html><html lang="en"><head>
<link rel="icon" href="/icon?zzz" sizes="64x64" type="image/png">
<link rel="canonical" href="https://kunanonj.com/about">
<meta property="og:image" content="https://kunanonj.com/opengraph-image-9z9z?ffff">
<link rel="modulepreload" href="/assets/main-abc.js">
<meta charset="utf-8"><meta content="width=device-width, initial-scale=1" name="viewport">
<title>About Kunanon Jarat &amp; friends</title></head>
<body><main lang="th"><h1>Hello there</h1></main>
<script type="application/ld+json">{"@type":"Person","name":"K"}</script></body></html>`;

describe("parity helpers", () => {
  it("parses attributes, lower-casing names and decoding entities", () => {
    expect(
      parseAttributes(` charSet="utf-8" content="a &amp; b" data-x='y'`),
    ).toEqual({
      charset: "utf-8",
      content: "a & b",
      "data-x": "y",
    });
  });

  it("normalises hashed metadata image URLs", () => {
    expect(
      normaliseUrl("https://kunanonj.com/x/opengraph-image-abc12?deadbeef"),
    ).toBe("https://kunanonj.com/x/opengraph-image");
    expect(normaliseUrl("/apple-icon?123")).toBe("/apple-icon");
  });

  it("drops framework plumbing and ignores tag order", () => {
    const tags = headTags(NEXT_HTML);
    expect(tags.some((t) => t.includes("_next"))).toBe(false);
    expect(tags.some((t) => t.includes("next-size-adjust"))).toBe(false);
    expect(headTags(START_HTML)).toEqual(tags);
  });

  it("extracts the crawler-visible page facts", () => {
    const page = extractPage(NEXT_HTML);
    expect(page).toMatchObject({
      htmlLang: "en",
      mainLang: "th",
      title: "About Kunanon Jarat & friends",
      h1: "Hello there",
    });
    expect(page.jsonLd).toEqual(['{"@type":"Person","name":"K"}']);
    expect(extractPage(START_HTML)).toEqual(page);
  });

  it("masks per-request timestamps in text bodies", () => {
    expect(
      normaliseBody(
        "<a><lastBuildDate>Mon, 09 Nov 2026 09:56:06 GMT</lastBuildDate></a>",
      ),
    ).toBe("<a><lastBuildDate>DATE</lastBuildDate></a>");
  });

  it("collects internal page links only", () => {
    expect(internalLinks(NEXT_HTML).sort()).toEqual([
      "/about",
      "/blog",
      "/skills",
    ]);
  });

  it("reports differences and honours ignores", () => {
    const a = {
      status: 200,
      title: "A",
      tags: ["meta x", "meta y"],
      jsonLd: [],
    };
    const b = {
      status: 404,
      title: "A",
      tags: ["meta x", "meta z"],
      jsonLd: [],
    };
    expect(diffRecord("/", a, a)).toEqual([]);
    expect(diffRecord("/", a, b)).toEqual([
      { field: "status", a: 200, b: 404 },
      { field: "tags", onlyA: ["meta y"], onlyB: ["meta z"] },
    ]);
    expect(diffRecord("/", a, b, ["*:status", "/:tags"])).toEqual([]);
    expect(diffRecord("/x", a, undefined)).toEqual([
      { field: "presence", a: true, b: false },
    ]);
  });
});
