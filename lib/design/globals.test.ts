import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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

/*
 * The preview-only stylesheet (profile redesign, Phase 1): profile.css and its
 * partials. Every guard that reads globals.css also reads these.
 */
const profileSheets = [
  "src/styles/profile.css",
  ...readdirSync(join(process.cwd(), "src/styles/profile"))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((name) => `src/styles/profile/${name}`),
].map((path) => ({
  path,
  css: readFileSync(join(process.cwd(), path), "utf8"),
}));

/**
 * The bare `.pf-` block selectors a sheet declares: a rule whose selector (or
 * one of its comma parts) is the block class alone, with no element (`__`),
 * modifier (`--`), state or combinator. Comments are dropped first.
 */
function bareBlocks(css: string): Set<string> {
  const blocks = new Set<string>();
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, prelude] of plain.matchAll(/([^{};]+)\{/g)) {
    if (prelude!.trim().startsWith("@")) continue;
    for (const selector of prelude!.split(",")) {
      const name = selector.trim();
      if (/^\.pf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) blocks.add(name);
    }
  }
  return blocks;
}

/** The CSS with every `prefers-reduced-motion: no-preference` block removed. */
function withoutNoPreference(css: string): string {
  let rest = css;
  for (;;) {
    const at = rest.search(
      /@media [^{]*prefers-reduced-motion: no-preference\)/,
    );
    if (at === -1) return rest;
    let depth = 0;
    let end = rest.indexOf("{", at);
    for (; end < rest.length; end += 1) {
      if (rest[end] === "{") depth += 1;
      if (rest[end] === "}" && --depth === 0) break;
    }
    rest = rest.slice(0, at) + rest.slice(end + 1);
  }
}

/**
 * Foundation contract: the profile redesign's palette and fonts, light by
 * default. Phase 6 removed the legacy aliases and Phase 8 the earlier design's
 * Geist faces, so nothing may bring them back.
 */
describe("visual-redesign foundation", () => {
  it("defines the palette (design spec 2.1) in both themes", () => {
    const dark =
      globalsCss.match(/^\.dark \{\n {2}--ink: #f1edfa;([\s\S]*?)^\}/m)?.[1] ??
      "";
    for (const [name, light, night] of [
      ["ink", "#120e1f", "#f1edfa"],
      ["paper", "#ffffff", "#0f0c18"],
      ["accent", "#6e3cff", "#8d6bff"],
      ["accent-ink", "#4b23c2", "#b9a4ff"],
      ["coral", "#ff7a3d", "#ff8a52"],
      ["coral-deep", "#d9541c", "#ff9e70"],
      ["tint-2", "#f3eeff", "#1c1630"],
    ]) {
      expect(tokenBlock, name).toMatch(new RegExp(`\\n  --${name}: ${light};`));
      if (name !== "ink") {
        expect(dark, name).toMatch(new RegExp(`\\n  --${name}: ${night};`));
      }
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

  it("uses the profile fonts and Noto Sans Thai, and drops the retired fonts", () => {
    const families = [
      ...fontsCss.matchAll(/font-family:\s*"?([^;"]+)"?;/g),
    ].map((m) => m[1]!.trim());
    expect(new Set(families)).toEqual(
      new Set([
        "Noto Sans Thai",
        "Noto Sans Thai Fallback",
        // Profile redesign (umbrella plan of 18-11-26, owner decisions 1 and 8
        // and "What these reverse"): the reference's type replaced Geist in
        // Phase 8. Instrument Serif left the retired list below.
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
      "Geist",
      "Geist Mono",
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
    // Theme colours live in the metadata module both frameworks share. The
    // profile redesign's cutover (Phase 6, design spec 2.1 and 13 item 23)
    // moved them from the owner palette (#0b0d17, #f5f6fa) to the new one.
    const rootMeta = readFileSync(
      join(process.cwd(), "lib/seo/rootMetadata.ts"),
      "utf8",
    );
    expect(rootMeta).toMatch(/#0f0c18/i);
    expect(rootMeta).toMatch(/#f7f3ff/i);
    expect(rootMeta).not.toMatch(/#0b0d17|#f5f6fa/i);
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
 * The motion contract: the owner's defaults for the site's motion, pinned so
 * a later edit cannot quietly undo them.
 */
describe("motion contract", () => {
  it("defines the role tokens with the new values", () => {
    // Each follows the theme through the palette the .dark block redefines;
    // contrast.test.ts checks both themes.
    for (const token of ["--cta", "--oncta", "--accent", "--muted"]) {
      expect(tokenBlock, token).toMatch(new RegExp(`\\n  ${token}:`));
    }
  });

  it("keeps every entrance and loop behind no-preference", () => {
    // Widened in the profile redesign (Phase 0, design spec 5.1): any
    // animation outside no-preference fails, not only kj- and intro- names,
    // and Phase 1 reads the profile stylesheet too. One exception, never
    // started under reduced motion: the intro's words belong to an overlay
    // that IntroLoader does not mount under reduced motion. (The circular
    // theme reveal was the other until the Phase 6 cutover; the theme fade
    // that replaced it sits inside no-preference.)
    const allowed = /^(none\b|intro-word-in\b)/;
    for (const { path, css } of [
      { path: "src/styles/globals.css", css: globalsCss },
      ...profileSheets,
    ]) {
      const loose = [
        ...withoutNoPreference(css).matchAll(/animation:\s*([^;]+);/g),
      ]
        .map((m) => m[1]!.trim())
        .filter((value) => !allowed.test(value));
      expect(loose, path).toEqual([]);
    }
    // The scan sees the status dot's ping, so it is not vacuous.
    expect(globalsCss).toMatch(/animation: kj-ping/);
  });

  it("names every keyframe kj- (or the intro's own intro-), so the guard covers it", () => {
    const names = [...globalsCss.matchAll(/@keyframes ([\w-]+)/g)].map(
      (m) => m[1]!,
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((n) => !/^(kj|intro)-/.test(n))).toEqual([]);
    for (const { path, css } of profileSheets) {
      const own = [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]!);
      expect(
        own.filter((n) => !/^kj-/.test(n)),
        path,
      ).toEqual([]);
    }
  });

  it("defines every keyframe a sheet animates, once: globals.css its own, the profile sheets theirs or globals.css's", () => {
    // globals.css loads on every page and stands alone; the profile sheets
    // load after it. A keyframe used but defined nowhere fails silently in
    // the browser (Phase 6 review, finding 6: kj-theme-fade lived only in
    // shell.css while globals.css ran it).
    const used = (css: string) =>
      new Set(
        [...css.matchAll(/animation(?:-name)?:\s*([^;]+);/g)].flatMap((m) =>
          [...m[1]!.matchAll(/\b((?:kj|intro)-[\w-]+)/g)].map((n) => n[1]!),
        ),
      );
    const defined = (css: string) =>
      [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]!);
    expect(
      [...used("a { animation: kj-orphan 1s; }")].filter(
        (name) => !defined("").includes(name),
      ),
    ).toEqual(["kj-orphan"]);

    const own = defined(globalsCss);
    expect([...used(globalsCss)].filter((name) => !own.includes(name))).toEqual(
      [],
    );
    expect(own).toContain("kj-theme-fade");

    const all = [...own, ...profileSheets.flatMap(({ css }) => defined(css))];
    for (const { path, css } of profileSheets) {
      expect(
        [...used(css)].filter((name) => !all.includes(name)),
        path,
      ).toEqual([]);
    }
    expect(all.filter((name, at) => all.indexOf(name) !== at)).toEqual([]);
  });

  it("fades theme switches on every page, only with no-preference, and turns view transitions off under reduced motion", () => {
    // The profile redesign's cutover (Phase 6, design spec 7.5 and 13 items
    // 6 and 23): the .56 s fade replaces the circular reveal site-wide.
    expect(globalsCss).not.toContain("kj-reveal");
    const fade = globalsCss.match(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*html\.kj-vt::view-transition-old\(root\),\s*html:active-view-transition-type\(theme\)::view-transition-old\(root\) \{[\s\S]*?\n\}/,
    )?.[0];
    expect(fade).toBeDefined();
    expect(fade).toMatch(
      /html\.kj-vt::view-transition-new\(root\),\s*html:active-view-transition-type\(theme\)::view-transition-new\(root\) \{\s*animation: kj-theme-fade 0\.56s/,
    );
    // Plain page navigations keep the UA cross-fade: no theme animation.
    expect(globalsCss).not.toMatch(
      /^::view-transition-new\(root\)\s*\{\s*animation: kj-/m,
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
 * Profile redesign (process/features/profile-site-redesign): the new tokens
 * lived in one scope, `data-design="profile"` on <html>, until Phase 8 folded
 * it into :root and .dark. Contrast pairs are in contrast.test.ts.
 */
const tokenBlock =
  globalsCss.match(
    /^:root \{\n {2}\/\* Palette \(spec 2\.1\)\. \*\/([\s\S]*?)^\}/m,
  )?.[1] ?? "";

describe("profile redesign tokens", () => {
  it("defines the tokens in :root and .dark, with no scope left", () => {
    expect(tokenBlock).toContain("--ink: #120e1f;");
    expect(globalsCss).toMatch(/^\.dark \{\n {2}--ink: #f1edfa;/m);
    expect(layoutTsx).not.toContain("data-design");
    for (const sheet of [globalsCss, ...profileSheets.map((p) => p.css)]) {
      expect(sheet).not.toMatch(/\[data-design/);
    }
  });

  it("never fakes bold or italic Instrument Serif", () => {
    expect(tokenBlock).toMatch(/font-synthesis-weight: none;/);
  });

  it("points Tailwind's preflight fonts at the new stacks", () => {
    expect(tokenBlock).toContain("--default-font-family: var(--font-sans);");
    expect(tokenBlock).toContain(
      "--default-mono-font-family: var(--font-mono);",
    );
  });

  it("gives the font utilities the tokens' own stacks", () => {
    // `@theme inline` bakes its stacks into font-sans, font-mono and
    // font-display, so they must be the tokens' stacks, never another face.
    const theme = globalsCss.match(/@theme inline \{([\s\S]*?)\n\}/)![1]!;
    for (const name of ["--font-sans", "--font-mono", "--font-display"]) {
      const stack = (css: string) =>
        css
          .match(new RegExp(`\\n\\s*${name}:([^;]+);`))?.[1]
          ?.replace(/\s+/g, " ")
          .trim();
      expect(stack(theme), name).toBe(stack(tokenBlock));
    }
    expect(globalsCss).not.toMatch(/geist/i);
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

/**
 * Profile redesign, Phase 1 (process/features/profile-site-redesign): the
 * preview stylesheet is layered and plain. profile.css fixes the layer order
 * before any other sheet can, each phase owns one partial, the partials hold no
 * raw hex colour, and no build-time CSS leaks in: they read tokens only.
 */
describe("profile stylesheet", () => {
  const entry = profileSheets[0]!.css;
  const partials = profileSheets.slice(1);

  it("declares the layer order first, then imports each phase's partial in order", () => {
    expect(entry).toMatch(/^@layer theme, base, components, utilities;/m);
    expect(entry.indexOf("@layer")).toBeLessThan(entry.indexOf("@import"));
    const imports = [
      ...entry.matchAll(/@import "\.\/(profile\/[\w-]+\.css)";/g),
    ].map((m) => m[1]);
    expect(imports).toEqual([
      "profile/shell.css",
      "profile/home-work-about.css",
      "profile/home-journey.css",
      "profile/case.css",
      "profile/cutover.css",
      "profile/pages-hubs.css",
      "profile/pages-catalog.css",
    ]);
  });

  it("leaves the Home hero's partial to the hero, so no other page loads it", () => {
    // UX sweep 21-11-26: home-hero.css was 2.9 KB gzip of every page's
    // first load. Hero.tsx links it (`precedence`), as ResumePage links
    // resume.css; the import list above keeps profile.css from taking it back.
    const hero = readFileSync(
      join(process.cwd(), "components/profile/home/Hero.tsx"),
      "utf8",
    );
    expect(hero).toContain(
      'import heroCss from "@/src/styles/profile/home-hero.css?url";',
    );
    expect(hero).toContain(
      '<link rel="stylesheet" href={heroCss} precedence="pf-home-hero" />',
    );
  });

  it("names its phase in each partial's first line, so a lane edits only its own", () => {
    const phases: Record<string, string> = {
      "shell.css": "Phase 1",
      "home-hero.css": "Phase 2",
      "home-work-about.css": "Phase 3",
      "home-journey.css": "Phase 4",
      "case.css": "Phase 5",
      "cutover.css": "Phase 6",
    };
    for (const [name, phase] of Object.entries(phases)) {
      const partial = partials.find((sheet) => sheet.path.endsWith(`/${name}`));
      expect(partial, name).toBeDefined();
      // The header may run to several lines; the phase is named in its first five.
      expect(partial!.css.split("\n").slice(0, 5).join("\n"), name).toContain(
        `Profile redesign, ${phase}`,
      );
    }
  });

  it("finds a sheet's bare block rules, and only those", () => {
    // The guard below must see a bare block rule and ignore elements,
    // modifiers, states and descendants, or a pass proves nothing.
    const fixture =
      ".pf-a, .pf-b-c { x: 1 } .pf-a__d { } .pf-a--e { } .pf-f:hover { } .pf-g .pf-h { } @media (width > 1px) { .pf-i { } }";
    expect([...bareBlocks(fixture)].sort()).toEqual([
      ".pf-a",
      ".pf-b-c",
      ".pf-i",
    ]);
  });

  it("declares each bare .pf- block in one partial only, so pages never share a block", () => {
    // Phase 6's All work page once reused Home's `.pf-work`: its later rule
    // reset the padding of Home's article#work. A block's base rule belongs
    // to one partial; another page names its own block.
    const owners = new Map<string, string[]>();
    for (const { path, css } of partials) {
      for (const block of bareBlocks(css)) {
        owners.set(block, [...(owners.get(block) ?? []), path]);
      }
    }
    expect([...owners].filter(([, paths]) => paths.length > 1)).toEqual([]);
  });

  it("has no raw hex colour in any profile sheet: colour comes from tokens", () => {
    for (const { path, css } of profileSheets) {
      expect(css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], path).toEqual([]);
    }
  });

  it("uses plain CSS only: no @apply, theme(), @utility or Tailwind imports", () => {
    for (const { path, css } of profileSheets) {
      expect(css, path).not.toMatch(
        /@apply|theme\(|@utility|@tailwind|@import "tailwindcss"/,
      );
    }
  });

  it("fails the motion guard on a fixture with a loose animation", () => {
    // The guard must fire on a known-bad sheet, or a pass proves nothing.
    const fixture =
      "a { animation: kj-loose 1s; } @media (prefers-reduced-motion: no-preference) { b { animation: kj-fine 1s; } }";
    const loose = [
      ...withoutNoPreference(fixture).matchAll(/animation:\s*([^;]+);/g),
    ].map((m) => m[1]!.trim());
    expect(loose).toEqual(["kj-loose 1s"]);
  });

  it("keeps movement and its transitions behind no-preference", () => {
    // Opacity and colour may move under reduced motion (spec 5.1); transform,
    // filter, width and registered custom properties may not.
    for (const { path, css } of profileSheets) {
      const outside = withoutNoPreference(css);
      const moving = [...outside.matchAll(/transition:\s*([^;]+);/g)]
        .map((m) => m[1]!)
        .filter((value) => /transform|filter|width|height|--/.test(value));
      expect(moving, path).toEqual([]);
    }
  });

  it("keeps the bar in view for keyboard focus only, and caps the popovers on short screens", () => {
    const shell = partials.find((sheet) =>
      sheet.path.endsWith("/shell.css"),
    )!.css;
    // A mouse click on a nav control must not pin the bar (only :focus-visible does).
    expect(shell).not.toMatch(/:not\(:focus-within\)/);
    expect(shell).toContain(":not(:has(:focus-visible))");
    // Each popover scrolls within the screen (WCAG 1.4.10, 2.4.11).
    // The footer's panel inherits the scrolling of .pf-say__panel; it sets its own cap.
    for (const panel of [
      ".pf-menu {",
      ".pf-say__panel {",
      ".pf-say__panel--footer {",
    ]) {
      const block = shell.slice(
        shell.indexOf(panel),
        shell.indexOf("}", shell.indexOf(panel)),
      );
      expect(block, panel).toContain("max-block-size: calc(100dvh");
      if (panel !== ".pf-say__panel--footer {") {
        expect(block, panel).toContain("overflow-y: auto");
        expect(block, panel).toContain("overscroll-behavior: contain");
      }
    }
    // Without the Popover API the panels wait for data-open.
    expect(shell).toMatch(
      /@supports not selector\(:popover-open\) \{\s*\.pf-say__panel,\s*\.pf-menu \{\s*display: none;/,
    );
    expect(shell).toMatch(/\.pf-menu\[data-open\] \{\s*display: block;/);
  });

  it("gives the popovers one motion, with exits only where `overlay` keeps them in the top layer", () => {
    const shell = partials.find((sheet) =>
      sheet.path.endsWith("/shell.css"),
    )!.css;
    // Both popovers enter from --pop-from, and the footer's from below.
    expect(shell).toMatch(
      /@starting-style \{\s*\.pf-menu:popover-open,\s*\.pf-say__panel:popover-open \{\s*opacity: 0;\s*transform: var\(--pop-from\);/,
    );
    expect(shell).toMatch(
      /\.pf-say__panel--footer \{\s*--pop-from: translateY\(6px\)/,
    );
    // The exit: Chromium only, and a closing panel takes no clicks.
    const exit = shell.match(
      /@supports \(overlay: auto\) \{[\s\S]*?\n {2}\}/,
    )?.[0];
    expect(exit).toBeDefined();
    expect(exit).toContain("overlay 0.2s allow-discrete");
    expect(exit).toContain("display 0.2s allow-discrete");
    expect(exit).toMatch(
      /\.pf-say__panel:not\(:popover-open\) \{[^}]*pointer-events: none;/,
    );
    // Every transition of theirs waits for no-preference.
    expect(withoutNoPreference(shell)).not.toContain("allow-discrete");
    // The share panel enters the same way, with no keyframes of its own.
    expect(globalsCss).toMatch(
      /@starting-style \{\s*\.kj-panel \{\s*opacity: 0;\s*transform: translateY\(-6px\) scale\(0\.97\);/,
    );
    expect(globalsCss).not.toContain("kj-pop");
  });

  it("runs the theme fade once, in globals.css, behind no-preference", () => {
    for (const sheet of partials) {
      expect(sheet.css, sheet.path).not.toContain("kj-theme-fade");
    }
    expect(withoutNoPreference(globalsCss)).not.toMatch(
      /animation:[^;]*kj-theme-fade/,
    );
    expect(globalsCss).toMatch(/animation: kj-theme-fade 0\.56s/);
    expect(globalsCss).toContain("@keyframes kj-theme-fade");
  });
});
