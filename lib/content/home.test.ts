import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { AVAILABILITY } from "@/lib/content/availability";
import { canvasMock, homeHero, logoStrip } from "@/lib/content/home";
import { caseHref } from "@/lib/content/profileChrome";
import { hero } from "@/lib/content/landing";
import { FEATURED_PORTFOLIO_SLUGS } from "@/lib/content/portfolio";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { getAllVentures } from "@/lib/content/ventures";
import parity from "@/tests/fixtures/site-parity.json";

/*
 * The redesigned Home's top (profile redesign, Phase 2): every line comes from
 * cleared content, the h1 says exactly what the live Home's says, and nothing
 * here adds a figure, a client or an organisation the site does not list.
 */

describe("homeHero", () => {
  it("names the h1 with the live Home's sentence, as the parity reference holds it", () => {
    const live = (parity as Record<string, { h1?: string }>)["/"]?.h1;
    expect(homeHero.title).toBe(live);
    expect(homeHero.title).toBe(
      "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.",
    );
  });

  it("opens line 2 with today's headline and holds one phrase until the owner approves alternates (R5)", () => {
    expect(homeHero.greetingLine).toBe(`${hero.greeting} ${hero.name}`);
    expect(homeHero.phrases[0]).toBe(
      "Forward deployed AI engineering from Bangkok.",
    );
    expect(homeHero.phrases).toHaveLength(1);
    expect(homeHero.rotateMs).toBe(4200);
  });

  it("reads the chips, the lead and the buttons from the site's content (R4)", () => {
    expect(homeHero.badge).toBe(AVAILABILITY.pill.label);
    expect(homeHero.chip).toBe("GoGoCash and Manut AI");
    // Word for word the site's lead; only the spaces inside the names are
    // no-break, so a phone never ends a line on "Manut" (keepWhole.ts).
    expect(homeHero.lead.replaceAll("\u00a0", " ")).toBe(hero.homeLead);
    expect(homeHero.lead).toContain("Manut\u00a0AI");
    expect(homeHero.lead).toContain("The\u00a0Binary\u00a0Holdings");
    // The ventures now, then the role that ended (owner direction 20-11-26).
    expect(hero.homeLead).toBe(
      "Building GoGoCash and Manut AI. Previously IT Manager & AI Engineering Lead at The Binary Holdings.",
    );
    expect(homeHero.primaryCta).toEqual({
      label: "Contact me",
      href: "/contact",
    });
    expect(homeHero.resumeCta).toEqual({ label: "Résumé", href: "/resume" });
  });
});

describe("logoStrip", () => {
  // "Currently" holds his own ventures since 20-11-26: the strip adds them last.
  const employers = RESUME_TIMELINE_FALLBACK.filter(
    (section) => section.title === "Experience",
  ).flatMap((section) => section.items.map((item) => item.logoName));

  it("lists every employer in the résumé, then the two ventures, once each (R6)", () => {
    for (const name of employers) expect(logoStrip.names).toContain(name);
    expect(logoStrip.names.slice(-2)).toEqual(["GoGoCash", "Manut AI"]);
    expect(new Set(logoStrip.names).size).toBe(logoStrip.names.length);
    expect(logoStrip.names[0]).toBe("The Binary Holdings");
  });

  it("names no organisation the site does not already list", () => {
    const known = new Set([
      ...employers,
      ...getAllVentures().map((venture) => venture.name),
    ]);
    for (const name of logoStrip.names) expect(known).toContain(name);
    expect(logoStrip.label).toBe("Where I’ve worked");
  });

  it("takes R6's two ventures only: one added to ventures.ts later does not join unapproved", async () => {
    vi.resetModules();
    vi.doMock("@/lib/content/ventures", async (importOriginal) => {
      const actual =
        await importOriginal<typeof import("@/lib/content/ventures")>();
      const extra = {
        ...actual.getVentureBySlug("manut")!,
        slug: "newco",
        name: "NewCo",
      };
      return {
        ...actual,
        getAllVentureSlugs: () => [...actual.getAllVentureSlugs(), "newco"],
        getAllVentures: () => [...actual.getAllVentures(), extra],
        getVentureBySlug: (slug: string) =>
          slug === "newco" ? extra : actual.getVentureBySlug(slug),
      };
    });
    try {
      const fresh = await import("@/lib/content/home");
      expect(fresh.logoStrip.names).not.toContain("NewCo");
      expect(fresh.logoStrip.names.slice(-2)).toEqual(["GoGoCash", "Manut AI"]);
    } finally {
      vi.doUnmock("@/lib/content/ventures");
      vi.resetModules();
    }
  });
});

describe("drafts", () => {
  it("marks every line that waits for the owner's approval as a DRAFT in its source", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/content/home.ts"),
      "utf8",
    ).split("\n");
    for (const fragment of [
      'label: "Where I’ve worked"',
      'label: "Featured projects"',
      'share: "Share"',
      "layersTabs: [",
      "inspectorTabs: [",
      'area: "Area"',
      'period: "Period"',
      'open: "Open project"',
      "· just now",
      ": open the case study",
      "`Show ${name}`",
      "of ${count}",
    ]) {
      const line = source.find((each) => each.includes(fragment));
      expect(line, fragment).toMatch(/\/\/ DRAFT/);
    }
  });
});

describe("canvasMock", () => {
  it("frames the three featured projects, in order, linked to their case studies", () => {
    expect(canvasMock.frames.map((frame) => frame.slug)).toEqual([
      ...FEATURED_PORTFOLIO_SLUGS,
    ]);
    for (const frame of canvasMock.frames) {
      expect(frame.href).toBe(`/portfolio/${frame.slug}`);
      expect(frame.name.length).toBeGreaterThan(0);
      // No featured project has a shareable screenshot yet (R10): each
      // frame draws its kind of screen instead.
      expect(frame.cover ?? frame.mockup).toBeTruthy();
    }
    expect(caseHref("ventures", "gogocash")).toBe("/ventures/gogocash");
  });

  it("names each frame link with its visible label first (WCAG 2.5.3)", () => {
    for (const frame of canvasMock.frames) {
      expect(canvasMock.frameName(frame.name)).toBe(
        `${frame.name}: open the case study`,
      );
      expect(canvasMock.showName(frame.name)).toBe(`Show ${frame.name}`);
    }
    expect(canvasMock.shown("AI Automation", 1, 3)).toBe(
      "AI Automation, 2 of 3",
    );
  });

  it("comments with a cleared operating principle and signs with the first name", () => {
    const principles = aboutPage.principles.items.map((item) => item.title);
    expect(principles).toContain(canvasMock.comment.line);
    expect(canvasMock.comment.initial).toBe("K");
    expect(canvasMock.comment.who).toBe("Kunanon · just now");
    expect(canvasMock.cursor).toBe("Kunanon");
    expect(canvasMock.breadcrumb).toEqual({
      owner: "Kunanon",
      file: "Selected work",
    });
  });

  it("adds no figure: the only numbers are the projects' own periods", () => {
    const copy = [
      canvasMock.label,
      canvasMock.share,
      ...canvasMock.layersTabs,
      ...canvasMock.inspectorTabs,
      canvasMock.area,
      canvasMock.period,
      canvasMock.open,
      canvasMock.illustration,
      canvasMock.comment.line,
      canvasMock.comment.who,
      logoStrip.label,
      homeHero.badge,
      homeHero.chip,
    ].join(" ");
    expect(copy).not.toMatch(/\d/);
  });
});
