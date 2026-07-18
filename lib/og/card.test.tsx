import { describe, expect, it } from "vitest";
import { OG_SIZE, OgCard } from "@/lib/og/card";
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
    const domain = siteConfig.url
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    expect(text).toContain(domain);
  });

  it("uses the FogLAMP near-black canvas, not the legacy pure black", () => {
    const tree = OgCard({ title: "x" }) as {
      props: { style: { background: string } };
    };
    expect(tree.props.style.background).toBe("#0a0a0a");
  });
});
