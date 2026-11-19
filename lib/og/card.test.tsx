import { describe, expect, it } from "vitest";
import { brand } from "@/lib/brand/tokens";
import { OG_SIZE, OgCard, clampText } from "@/lib/og/card";
import { siteConfig } from "@/lib/site";

function flattenText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join(" ");
  if (typeof node === "object" && "props" in (node as Record<string, unknown>))
    return flattenText(
      (node as { props: { children?: unknown } }).props.children,
    );
  return "";
}

/** Calls function components, as satori does, so the whole card is plain JSON. */
function expand(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(expand);
  if (node && typeof node === "object" && "props" in node) {
    const element = node as {
      type: unknown;
      props: Record<string, unknown> & { children?: unknown };
    };
    if (typeof element.type === "function") {
      return expand((element.type as (p: unknown) => unknown)(element.props));
    }
    return {
      ...element,
      props: { ...element.props, children: expand(element.props.children) },
    };
  }
  return node;
}

describe("OgCard", () => {
  it("exports the standard 1200x630 share size", () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it("renders eyebrow, title and subtitle into the card tree", () => {
    const tree = OgCard({
      eyebrow: "Case study",
      title: "GoGoCash",
      subtitle: "Shopping-to-earn cashback",
    });
    const text = flattenText(tree);
    expect(text).toContain("Case study");
    expect(text).toContain("GoGoCash");
    expect(text).toContain("Shopping-to-earn cashback");
    expect(text).toContain("Kunanon Jarat.");
    const domain = siteConfig.url
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    expect(text).toContain(domain);
  });

  it("uses the redesign palette: a paper field, ink type, Onest", () => {
    const tree = OgCard({ title: "x" }) as {
      props: {
        style: { background: string; color: string; fontFamily: string };
      };
    };
    expect(tree.props.style.background).toBe(brand.paper);
    expect(tree.props.style.color).toBe(brand.ink);
    expect(tree.props.style.fontFamily).toBe("Onest");
  });

  it("sets the title in Instrument Serif over the dither band's tints", () => {
    const json = JSON.stringify(expand(OgCard({ title: "Seeded" })));
    expect(json).toContain('"fontFamily":"Instrument Serif"');
    for (const tint of [brand.peach, brand.tint4, brand.tint3]) {
      expect(json).toContain(tint);
    }
    // Each title draws its own band.
    expect(JSON.stringify(expand(OgCard({ title: "Another" })))).not.toBe(json);
  });

  it("cuts a long subtitle at a word, with an ellipsis", () => {
    expect(clampText("Short enough.", 118)).toBe("Short enough.");
    const long =
      "Use when reviewing a branch, PR, or WIP since a commit, tag, or merge-base. Two-axis Standards and Spec review via parallel sub-agents.";
    const cut = clampText(long, 118);
    expect(cut.length).toBeLessThanOrEqual(118);
    expect(cut.endsWith("…")).toBe(true);
    expect(long.startsWith(cut.slice(0, -1))).toBe(true);
    expect(cut).not.toMatch(/[\s,.]…$/);
  });
});
