import { describe, expect, it } from "vitest";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { paragraphLinks, portableTextLinks } from "@/lib/content/noteLinks";

describe("portableTextLinks", () => {
  it("lists link annotations in reading order, once each, with short labels", () => {
    const links = portableTextLinks([
      {
        _type: "block",
        markDefs: [
          {
            _key: "a",
            _type: "link",
            href: "/topics/ai-transformation-thailand",
          },
          {
            _key: "b",
            _type: "link",
            href: "https://kunanonj.com/ventures/manut",
          },
        ],
        children: [
          { _type: "span", marks: ["strong"] },
          { _type: "span", marks: ["b"] },
          { _type: "span", marks: ["a", "em"] },
        ],
      },
      { _type: "image" },
      {
        _type: "block",
        markDefs: [
          { _key: "c", _type: "link", href: "https://www.github.com/KunanonJ" },
          {
            _key: "d",
            _type: "link",
            href: "/topics/ai-transformation-thailand",
          },
        ],
        children: [{ marks: ["c"] }, { marks: ["d"] }, { marks: "bad" }],
      },
    ]);
    expect(links).toEqual([
      { href: "https://kunanonj.com/ventures/manut", label: "/ventures/manut" },
      {
        href: "/topics/ai-transformation-thailand",
        label: "/topics/ai-transformation-thailand",
      },
      {
        href: "https://www.github.com/KunanonJ",
        label: "github.com/KunanonJ",
      },
    ]);
  });

  it("returns nothing for a body without links", () => {
    expect(portableTextLinks([{ _type: "block", children: [] }])).toEqual([]);
  });
});

describe("paragraphLinks", () => {
  it("finds the cornerstone's site paths", () => {
    const post = FALLBACK_BLOG_POSTS.find(
      (p) => p.slug === "ai-transformation-thailand-smes",
    );
    expect(paragraphLinks(post?.bodyParagraphs ?? [])).toEqual([
      {
        href: "/topics/ai-transformation-thailand",
        label: "/topics/ai-transformation-thailand",
      },
      { href: "/ventures/manut", label: "/ventures/manut" },
    ]);
  });
});
