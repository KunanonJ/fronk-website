import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AA_NON_TEXT,
  AA_TEXT,
  contrastRatio,
  parseColor,
} from "@/lib/design/contrast";

const css = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8");

/** Collects custom properties from every top-level block with this selector. */
function block(selector: ":root" | ".dark"): Record<string, string> {
  const escaped = selector.replace(".", "\\.");
  const re = new RegExp(`^${escaped}\\s*\\{([\\s\\S]*?)^\\}`, "gm");
  const out: Record<string, string> = {};
  for (const match of css.matchAll(re)) {
    const body = match[1]!.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      out[decl[1]!] = decl[2]!.trim().replace(/\s+/g, " ");
    }
  }
  return out;
}

const light = block(":root");
const dark = { ...light, ...block(".dark") };

function resolve(
  vars: Record<string, string>,
  name: string,
  depth = 0,
): string {
  const value = vars[name];
  if (value === undefined) throw new Error(`Missing token ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref) {
    if (depth > 8) throw new Error(`Cycle at ${name}`);
    return resolve(vars, ref[1]!, depth + 1);
  }
  return value;
}

const themes = { light, dark } as const;

/** Text pairs (fg on bg) that must reach 4.5:1 in both themes. */
const TEXT_PAIRS: readonly [string, string][] = [
  ["--ink", "--page"],
  ["--ink", "--surface"],
  ["--ink", "--surface-tint"],
  ["--ink", "--surface-warm"],
  ["--ink", "--well"],
  ["--ink-2", "--page"],
  ["--ink-2", "--surface"],
  ["--ink-2", "--surface-tint"],
  ["--ink-2", "--surface-warm"],
  ["--on-action", "--action"],
  ["--on-action", "--action-hover"],
  ["--link", "--page"],
  ["--link", "--surface"],
  ["--link", "--surface-tint"],
  ["--error-text", "--page"],
  ["--error-text", "--surface"],
  ["--error-text", "--surface-tint"],
  ["--error-text", "--surface-warm"],
  ["--success-text", "--page"],
  ["--success-text", "--surface"],
  ["--success-text", "--surface-tint"],
  ["--success-text", "--surface-warm"],
];

/** Non-text pairs (focus rings, state markers) that must reach 3:1. */
const NON_TEXT_PAIRS: Record<keyof typeof themes, readonly [string, string][]> =
  {
    light: [
      ["--focus", "--page"],
      ["--focus", "--surface"],
      // Ember markers sit on Paper only in light mode.
      ["--ember", "--surface"],
    ],
    dark: [
      ["--focus", "--page"],
      ["--focus", "--surface"],
      ["--ember", "--page"],
      ["--ember", "--surface"],
    ],
  };

describe("design tokens meet WCAG AA in both themes", () => {
  for (const [theme, vars] of Object.entries(themes)) {
    for (const [fg, bg] of TEXT_PAIRS) {
      it(`${theme}: ${fg} on ${bg} >= 4.5`, () => {
        const ratio = contrastRatio(
          resolve(vars, fg),
          resolve(vars, bg),
          resolve(vars, "--page"),
        );
        expect(
          ratio,
          `${fg} on ${bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
    for (const [fg, bg] of NON_TEXT_PAIRS[theme as keyof typeof themes]) {
      it(`${theme}: ${fg} on ${bg} >= 3`, () => {
        const ratio = contrastRatio(
          resolve(vars, fg),
          resolve(vars, bg),
          resolve(vars, "--page"),
        );
        expect(
          ratio,
          `${fg} on ${bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
  }
});

describe("palette rules the components rely on", () => {
  it("Signal fails on Ink, which is why dark mode uses a lighter link colour", () => {
    expect(contrastRatio("#2b3bff", "#0b0d17")).toBeLessThan(AA_NON_TEXT);
    expect(resolve(dark, "--link")).not.toBe(resolve(light, "--link"));
  });

  it("Ember fails 3:1 on the light tints, so markers never sit on them", () => {
    for (const tint of [
      "--palette-glaze",
      "--palette-clay",
      "--palette-mist",
    ]) {
      expect(
        contrastRatio(resolve(light, "--palette-ember"), resolve(light, tint)),
      ).toBeLessThan(AA_NON_TEXT);
    }
  });
});

describe("contrast helpers", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#2b3bff", "#ffffff")).toBeCloseTo(6.62, 1);
  });

  it("composites translucent colours over their background", () => {
    expect(parseColor("rgba(11, 13, 23, 0.5)").a).toBe(0.5);
    const half = contrastRatio("rgba(0, 0, 0, 0.5)", "#ffffff");
    expect(half).toBeGreaterThan(3);
    expect(half).toBeLessThan(5);
  });
});
