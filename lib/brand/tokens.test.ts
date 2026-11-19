import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brand } from "@/lib/brand/tokens";
import { composite, mixColors, parseColor } from "@/lib/design/contrast";

/**
 * lib/brand/tokens.ts is a hand-kept mirror of the light theme's tokens for
 * the icons and share cards. Each value must equal the token it copies, as
 * the browser computes it, so the mirror cannot drift again.
 */
const css = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8");
const tokens =
  css.match(
    /^:root \{\n {2}\/\* Palette \(spec 2\.1\)\. \*\/([\s\S]*?)^\}/m,
  )?.[1] ?? "";

function token(name: string): string {
  const value = tokens.match(new RegExp(`\\n\\s*${name}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`No ${name} in the :root token block`);
  return value.trim();
}

const hex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/** `color-mix(in srgb, var(--ink) N%, transparent)` on paper. */
function inkOnPaper(name: string): string {
  const percent = Number(
    token(name).match(
      /color-mix\(in srgb, var\(--ink\) ([\d.]+)%, transparent\)/,
    )![1],
  );
  const mix = mixColors(
    parseColor(token("--ink")),
    parseColor("transparent"),
    percent / 100,
  );
  return hex(composite(mix, parseColor(token("--paper"))));
}

describe("brand tokens mirror globals.css", () => {
  it("copies the palette", () => {
    expect(brand.ink).toBe(token("--ink"));
    expect(brand.paper).toBe(token("--paper"));
    expect(brand.accent).toBe(token("--accent"));
    expect(brand.accentInk).toBe(token("--accent-ink"));
    expect(brand.tint2).toBe(token("--tint-2"));
    expect(brand.tint3).toBe(token("--tint-3"));
    expect(brand.tint4).toBe(token("--tint-4"));
    expect(brand.peach).toBe(token("--peach"));
  });

  it("flattens the ink mixes onto paper as the browser does", () => {
    expect(brand.inkMuted).toBe(inkOnPaper("--ink-60"));
    expect(brand.hairline).toBe(inkOnPaper("--line"));
  });
});
