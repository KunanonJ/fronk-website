import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

const globalsCss = readFileSync(
  join(process.cwd(), "src/styles/globals.css"),
  "utf8",
);
const fontsCss = readFileSync(
  join(process.cwd(), "src/styles/fonts.css"),
  "utf8",
);
const layoutTsx = readFileSync(
  join(process.cwd(), "src/routes/__root.tsx"),
  "utf8",
);
const landingLayout = readFileSync(
  join(process.cwd(), "components/landing/LandingLayout.tsx"),
  "utf8",
);

/**
 * Foundation contract for the visual redesign (Phase 0, 09-11-26): the owner's
 * palette, light by default, Geist + Geist Mono. Phase 6 removed the legacy
 * aliases, so nothing may bring them back.
 */
describe("visual-redesign foundation", () => {
  it("defines the owner's palette once", () => {
    for (const [name, hex] of [
      ["signal", "#2b3bff"],
      ["glaze", "#e8ebff"],
      ["paper", "#ffffff"],
      ["ink", "#0b0d17"],
      ["clay", "#ffe3d6"],
      ["ember", "#ff5a1f"],
    ]) {
      expect(globalsCss).toMatch(
        new RegExp(`--palette-${name}:\\s*${hex}`, "i"),
      );
    }
  });

  it("maps role tokens into Tailwind, with no legacy aliases left", () => {
    for (const role of [
      "page",
      "ink",
      "ink-2",
      "action",
      "link",
      "focus",
      "ember",
      "hairline",
    ]) {
      expect(globalsCss).toMatch(new RegExp(`--color-${role}:\\s*var\\(--`));
    }
    for (const legacy of [
      "--landing-canvas",
      "--landing-ink",
      "--color-primary",
      "--color-landing",
      "--color-cream",
      "--color-fg",
      "--color-muted",
      "--color-accent",
      "--bg:",
      "--fg:",
      "--grain-opacity",
      "@utility label-mono",
      "@utility rule-hud",
    ]) {
      expect(globalsCss, legacy).not.toContain(legacy);
    }
  });

  it("uses Geist, Geist Mono, Noto Sans Thai and the profile fonts, and drops the retired fonts", () => {
    const families = [
      ...fontsCss.matchAll(/font-family:\s*"?([^;"]+)"?;/g),
    ].map((m) => m[1]!.trim());
    expect(new Set(families)).toEqual(
      new Set([
        "Geist",
        "Geist Fallback",
        "Geist Mono",
        "Geist Mono Fallback",
        "Noto Sans Thai",
        "Noto Sans Thai Fallback",
        // Profile redesign (umbrella plan of 18-11-26, owner decisions 1 and 8
        // and "What these reverse"): the reference's type joins Geist, which
        // Phase 8 removes. Instrument Serif leaves the retired list below.
        "Instrument Serif",
        "Instrument Serif Fallback",
        "Onest",
        "Onest Fallback",
        "JetBrains Mono",
        "JetBrains Mono Fallback",
        "Patrick Hand",
      ]),
    );
    for (const retired of [
      "Hanken Grotesk",
      "Space Mono",
      "Almarai",
      "Inter",
    ]) {
      expect(families).not.toContain(retired);
    }
    // The retired font aliases are gone too.
    for (const alias of [
      "--font-instrument-serif",
      "--font-almarai",
      "--font-hanken",
      "--font-serif",
    ]) {
      expect(globalsCss, alias).not.toContain(alias);
    }
  });

  it("defaults to light with the toggle unlocked and palette themeColors", () => {
    expect(layoutTsx).not.toContain("forcedTheme");
    expect(layoutTsx).toContain('defaultTheme="light"');
    // Theme colours live in the metadata module both frameworks share.
    const rootMeta = readFileSync(
      join(process.cwd(), "lib/seo/rootMetadata.ts"),
      "utf8",
    );
    expect(rootMeta).toMatch(/#0b0d17/i);
    expect(rootMeta).toMatch(/#f5f6fa/i);
  });

  it("keeps the landing shell wrapper and skip link", () => {
    expect(landingLayout).toContain("landing-root");
    expect(landingLayout).toContain('href="#main"');
  });

  it("does not mount FogLAMP SiteShell chrome in root layout", () => {
    expect(layoutTsx).not.toContain("SiteShell");
    expect(layoutTsx).not.toContain("Header");
    expect(layoutTsx).not.toContain("Footer");
  });

  it("does not import Lenis on the public CSS shell", () => {
    expect(globalsCss).not.toMatch(/@import\s+["']lenis/);
  });

  it("preserves the print palette and reduced-motion guard", () => {
    expect(globalsCss).toMatch(/@media print/);
    expect(globalsCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});

/**
 * Bento redesign (phase 7a) motion contract: the owner's defaults for the
 * canvas motion, pinned so a later edit cannot quietly undo them.
 */
describe("bento motion contract", () => {
  const keyframes = (name: string) =>
    globalsCss.match(
      new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`),
    )?.[1] ?? "";

  it("defines the new role tokens in both themes", () => {
    for (const token of ["--cta", "--oncta", "--accent", "--muted"]) {
      expect(
        globalsCss.match(new RegExp(`\\s${token}:`, "g"))?.length,
        token,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("never hides or blurs the LCP h1: its lines only move", () => {
    const line = keyframes("kj-line");
    expect(line).toContain("transform");
    expect(line).not.toMatch(/opacity|filter/);
  });

  it("keeps every entrance and loop behind no-preference", () => {
    // Drop each no-preference block (brace-matched); nothing left may animate.
    let rest = globalsCss;
    for (;;) {
      const at = rest.search(
        /@media [^{]*prefers-reduced-motion: no-preference\)/,
      );
      if (at === -1) break;
      let depth = 0;
      let end = rest.indexOf("{", at);
      for (; end < rest.length; end += 1) {
        if (rest[end] === "{") depth += 1;
        if (rest[end] === "}" && --depth === 0) break;
      }
      rest = rest.slice(0, at) + rest.slice(end + 1);
    }
    // Widened in the profile redesign (Phase 0, design spec 5.1): any
    // animation outside no-preference fails, not only kj- and intro- names.
    // Two exceptions, each never started under reduced motion: the theme
    // reveal is a view transition the toggle skips (and the reduced-motion
    // block below disables), and the intro's words belong to an overlay that
    // IntroLoader does not mount under reduced motion.
    const allowed = /^(none\b|kj-reveal\b|intro-word-in\b)/;
    const loose = [...rest.matchAll(/animation:\s*([^;]+);/g)]
      .map((m) => m[1]!.trim())
      .filter((value) => !allowed.test(value));
    expect(loose).toEqual([]);
    expect(globalsCss).toMatch(/animation: kj-rise/);
  });

  it("names every keyframe kj- (or the intro's own intro-), so the guard covers it", () => {
    const names = [...globalsCss.matchAll(/@keyframes ([\w-]+)/g)].map(
      (m) => m[1]!,
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((n) => !/^(kj|intro)-/.test(n))).toEqual([]);
  });

  it("scopes the circular reveal to theme switches and turns view transitions off under reduced motion", () => {
    expect(globalsCss).toMatch(
      /:active-view-transition-type\(theme\)::view-transition-new\(root\)\s*\{\s*animation: kj-reveal/,
    );
    expect(globalsCss).toMatch(
      /html\.kj-vt::view-transition-new\(root\)\s*\{\s*animation: kj-reveal/,
    );
    expect(globalsCss).not.toMatch(
      /^::view-transition-new\(root\)\s*\{\s*animation: kj-reveal/m,
    );
    expect(globalsCss).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{\s*::view-transition-group\(\*\),\s*::view-transition-old\(\*\),\s*::view-transition-new\(\*\)\s*\{\s*animation: none !important/,
    );
  });

  it("no longer ships the retired cursor or keyword tooltips", () => {
    expect(globalsCss).not.toContain("smooth-cursor");
    expect(globalsCss).not.toContain(".keyword");
    expect(layoutTsx).not.toContain("RouteFade");
  });
});

/**
 * Profile redesign, Phase 0 (process/features/profile-site-redesign): the new
 * tokens live in one scope, `data-design="profile"` on <html>, until the
 * cutover. Contrast pairs for the scope are in contrast.test.ts.
 */
describe("profile redesign scope", () => {
  it("defines the scope in both themes", () => {
    expect(globalsCss).toMatch(/^\[data-design="profile"\] \{/m);
    expect(globalsCss).toMatch(
      /^html\.dark\[data-design="profile"\],\n\.dark \[data-design="profile"\] \{/m,
    );
  });

  it("never fakes bold or italic Instrument Serif", () => {
    const scope =
      globalsCss.match(/^\[data-design="profile"\] \{([\s\S]*?)^\}/m)?.[1] ??
      "";
    expect(scope).toMatch(/font-synthesis-weight: none;/);
  });

  it("sets the scope on <html> from the matched routes, for the preview only", () => {
    expect(layoutTsx).toContain("data-design={design}");
    expect(layoutTsx).toMatch(/profileDesign\(s\.matches\.map/);
    expect(read("lib/design/scope.ts")).toMatch(/new Set\(\["\/preview"\]\)/);
  });

  it("points Tailwind's preflight fonts at the scope's own stacks", () => {
    const scope =
      globalsCss.match(/^\[data-design="profile"\] \{([\s\S]*?)^\}/m)?.[1] ??
      "";
    expect(scope).toContain("--default-font-family: var(--font-sans);");
    expect(scope).toContain("--default-mono-font-family: var(--font-mono);");
  });

  it("keeps the frozen font utilities out of the redesign's components", () => {
    // `@theme inline` bakes the Geist stacks into font-sans, font-mono and
    // font-display, so inside the scope they would render the old fonts.
    const offenders = sourceFiles([
      "components/ds",
      "components/profile",
    ]).filter((f) => /\bfont-(?:sans|mono|display)\b/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("keeps the preview's reader-preference blocks", () => {
    for (const query of [
      "prefers-contrast: more",
      "prefers-reduced-transparency: reduce",
      "forced-colors: active",
    ]) {
      expect(globalsCss, query).toContain(`@media (${query})`);
    }
  });
});
