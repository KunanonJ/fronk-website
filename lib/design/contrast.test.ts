import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AA_NON_TEXT,
  AA_TEXT,
  contrastRatio,
  mixColors,
  parseColor,
  type Rgba,
} from "@/lib/design/contrast";
import { isZoomSafeClamp, parseClamp, remValue } from "@/lib/design/fluidType";

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
  // Bento redesign (phase 7a): ink primary buttons, pressed chips and
  // segments, and accent text (the Home h1's last line, mono step numbers).
  ["--oncta", "--cta"],
  ["--accent", "--page"],
  ["--accent", "--surface"],
  ["--accent", "--surface-tint"],
];

/**
 * Large-text pairs (3:1): --muted is only for the connector words inside
 * display headings (36 px and up), never for body copy.
 */
const LARGE_TEXT_PAIRS: readonly [string, string][] = [
  ["--muted", "--page"],
  ["--muted", "--surface"],
];

/** Non-text pairs (focus rings, state markers) that must reach 3:1. */
const NON_TEXT_PAIRS: Record<keyof typeof themes, readonly [string, string][]> =
  {
    light: [
      ["--focus", "--page"],
      ["--focus", "--surface"],
      // Ember markers sit on Paper only in light mode.
      ["--ember", "--surface"],
      // Accent marker squares and timeline dots.
      ["--accent", "--page"],
      ["--accent", "--surface"],
    ],
    dark: [
      ["--focus", "--page"],
      ["--focus", "--surface"],
      ["--ember", "--page"],
      ["--ember", "--surface"],
      ["--accent", "--page"],
      ["--accent", "--surface"],
    ],
  };

describe("design tokens meet WCAG AA in both themes", () => {
  for (const [theme, vars] of Object.entries(themes)) {
    for (const [fg, bg] of TEXT_PAIRS) {
      it(`${theme}: ${fg} on ${bg} >= 4.5`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(
          ratio,
          `${fg} on ${bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
    for (const [fg, bg] of LARGE_TEXT_PAIRS) {
      it(`${theme}: ${fg} on ${bg} >= 3 (display text only)`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(
          ratio,
          `${fg} on ${bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
    for (const [fg, bg] of NON_TEXT_PAIRS[theme as keyof typeof themes]) {
      it(`${theme}: ${fg} on ${bg} >= 3`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(
          ratio,
          `${fg} on ${bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
  }
});

/*
 * The profile redesign's tokens (process/features/profile-site-redesign).
 * Phase 8 folded its scope into :root and .dark, so they are the themes
 * above. Mixes (color-mix with transparent) and the oklch case materials are
 * evaluated as CSS computes them.
 */

/** The token overrides inside one @media block. */
function mediaScope(query: string): Record<string, string> {
  const at = css.indexOf(`@media (${query}) {\n  :root,\n  .dark {`);
  if (at === -1) throw new Error(`No ${query} token block`);
  const body = css.slice(css.indexOf("{", css.indexOf("{", at) + 1) + 1);
  const out: Record<string, string> = {};
  for (const decl of body
    .slice(0, body.indexOf("}"))
    .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[decl[1]!] = decl[2]!.trim();
  }
  return out;
}

const profileThemes = themes;

function substitute(
  vars: Record<string, string>,
  value: string,
  depth = 0,
): string {
  if (depth > 16) throw new Error(`Cycle in ${value}`);
  return value.replace(/var\((--[\w-]+)\)/g, (_m, name: string) => {
    const next = vars[name];
    if (next === undefined) throw new Error(`Missing token ${name}`);
    return substitute(vars, next, depth + 1);
  });
}

function evaluateColor(expr: string): Rgba {
  const mix = expr
    .trim()
    .match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/);
  if (mix) {
    return mixColors(
      evaluateColor(mix[1]!),
      evaluateColor(mix[3]!),
      Number(mix[2]) / 100,
    );
  }
  return parseColor(expr);
}

function profileColor(vars: Record<string, string>, name: string): string {
  const { r, g, b, a } = evaluateColor(substitute(vars, `var(${name})`));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function profileRatio(
  vars: Record<string, string>,
  fg: string,
  bg: string,
): number {
  return contrastRatio(
    profileColor(vars, fg),
    profileColor(vars, bg),
    profileColor(vars, "--page"),
  );
}

const MATERIAL_HUES = [253, 79, 292, 327, 266, 301] as const;
const MATERIALS = MATERIAL_HUES.flatMap((h) => [
  `--material-${h}-a`,
  `--material-${h}-b`,
]);

/** Text pairs (4.5:1): the design system's Accessibility table. */
const PROFILE_TEXT: readonly [string, string][] = [
  ...[
    "--page",
    "--well",
    "--paper-3",
    "--surface-tint",
    "--surface-warm",
    "--sunset-1",
    "--sunset-2",
    "--sunset-3",
    ...MATERIALS,
  ].map((bg) => ["--ink", bg] as [string, string]),
  ["--ink-80", "--page"],
  ["--ink-80", "--well"],
  ...["--page", "--well", ...MATERIALS].map(
    (bg) => ["--muted-strong", bg] as [string, string],
  ),
  // The small-text floor, on every ground it is allowed on.
  ...[
    "--page",
    "--well",
    "--surface-tint",
    "--sunset-1",
    "--sunset-2",
    "--sunset-3",
  ].map((bg) => ["--ink-2", bg] as [string, string]),
  ["--link", "--page"],
  ["--link", "--well"],
  ["--link", "--accent-soft"],
  ["--link", "--surface-tint"],
  ["--on-action", "--action"],
  ["--oncta", "--cta"],
  ["--error-text", "--page"],
  ["--error-text", "--well"],
  ["--success-text", "--page"],
  ["--success-text", "--well"],
  ["--leaf-ink", "--leaf"],
  ["--leaf-ink-68", "--leaf"],
  ["--on-stats", "--stats-1"],
  ["--on-stats", "--stats-2"],
  ["--on-stats", "--stats-3"],
];

/** Display text of 24 px or more (3:1). */
const PROFILE_LARGE: readonly [string, string][] = [
  ["--muted", "--page"],
  ["--muted", "--well"],
  ["--ember", "--page"],
];

/** Focus rings, marks and input borders (3:1). */
const PROFILE_NON_TEXT: readonly [string, string][] = [
  ["--focus", "--page"],
  ["--focus", "--well"],
  ["--focus", "--paper-3"],
  ["--focus", "--surface-tint"],
  ["--focus", "--sunset-1"],
  ["--accent", "--page"],
  ["--ink-45", "--page"],
  ["--ember", "--page"],
];

describe("profile scope meets WCAG AA in both themes", () => {
  for (const [theme, vars] of Object.entries(profileThemes)) {
    for (const [fg, bg] of PROFILE_TEXT) {
      it(`${theme}: ${fg} on ${bg} >= 4.5`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(ratio, ratio.toFixed(2)).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
    for (const [fg, bg] of PROFILE_LARGE) {
      it(`${theme}: ${fg} on ${bg} >= 3 (24 px and up)`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(ratio, ratio.toFixed(2)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
    for (const [fg, bg] of PROFILE_NON_TEXT) {
      it(`${theme}: ${fg} on ${bg} >= 3 (non-text)`, () => {
        const ratio = profileRatio(vars, fg, bg);
        expect(ratio, ratio.toFixed(2)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
  }

  it("records why summaries on light materials use --muted-strong", () => {
    const lowest = Math.min(
      ...MATERIALS.map((m) => profileRatio(profileThemes.light, "--ink-2", m)),
    );
    expect(lowest).toBeLessThan(AA_TEXT);
  });

  it("records why coral is never text or the only mark on light paper", () => {
    expect(profileRatio(profileThemes.light, "--coral", "--page")).toBeLessThan(
      AA_NON_TEXT,
    );
  });
});

describe("profile scope under prefers-contrast: more", () => {
  const more = mediaScope("prefers-contrast: more");
  for (const [theme, vars] of Object.entries(profileThemes)) {
    for (const bg of ["--page", "--well", "--surface-tint", "--sunset-1"]) {
      it(`${theme}: small text on ${bg} reaches 7:1`, () => {
        const ratio = profileRatio({ ...vars, ...more }, "--ink-2", bg);
        expect(ratio, ratio.toFixed(2)).toBeGreaterThanOrEqual(7);
      });
    }
  }
});

describe("profile scope theme colour", () => {
  // The values Phase 6 puts in the theme-color metas (design spec 2.1).
  it("matches the browser-chrome colours in both themes", () => {
    expect(light["--theme-color"]).toBe("#f7f3ff");
    expect(dark["--theme-color"]).toBe("#0f0c18");
  });
});

describe("profile type stays zoom-safe (WCAG 1.4.4)", () => {
  const sizes = Object.entries(light).filter(([name]) =>
    name.startsWith("--type-"),
  );

  it("finds the type scale", () => {
    expect(sizes.length).toBeGreaterThanOrEqual(8);
  });

  for (const [name, value] of sizes) {
    it(`${name} clamps between rem bounds`, () => {
      const parts = parseClamp(value);
      expect(parts, value).not.toBeNull();
      expect(remValue(parts!.min), parts!.min).not.toBeNull();
      expect(remValue(parts!.max), parts!.max).not.toBeNull();
    });

    it(`${name} still doubles at 200% zoom`, () => {
      const parts = parseClamp(value)!;
      expect(
        isZoomSafeClamp(remValue(parts.min)!, remValue(parts.max)!),
        value,
      ).toBe(true);
    });
  }
});

describe("contrast helpers", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#2b3bff", "#ffffff")).toBeCloseTo(6.62, 1);
  });

  it("converts oklch and mixes like CSS", () => {
    // oklch(0.628 0.2577 29.23) is sRGB red.
    expect(parseColor("oklch(0.628 0.2577 29.23)")).toMatchObject({
      r: 255,
      g: 0,
      b: 0,
    });
    const mixed = mixColors(
      parseColor("#120e1f"),
      parseColor("transparent"),
      0.6,
    );
    expect(mixed.r).toBeCloseTo(18);
    expect(mixed.g).toBeCloseTo(14);
    expect(mixed.b).toBeCloseTo(31);
    expect(mixed.a).toBeCloseTo(0.6);
  });

  it("composites translucent colours over their background", () => {
    expect(parseColor("rgba(11, 13, 23, 0.5)").a).toBe(0.5);
    const half = contrastRatio("rgba(0, 0, 0, 0.5)", "#ffffff");
    expect(half).toBeGreaterThan(3);
    expect(half).toBeLessThan(5);
  });
});
