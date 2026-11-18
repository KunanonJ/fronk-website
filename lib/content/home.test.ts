import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { canvasMock, caseHref, homeHero, logoStrip } from "@/lib/content/home";
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
    expect(homeHero.badge).toBe(OPEN_TO_ROLES.pill.label);
    expect(homeHero.location).toBe(OPEN_TO_ROLES.location);
    expect(homeHero.lead).toBe(hero.homeLead);
    expect(homeHero.primaryCta).toEqual({
      label: "Contact me",
      href: "/contact",
    });
    expect(homeHero.resumeCta).toEqual({ label: "Résumé", href: "/resume" });
  });
});

describe("logoStrip", () => {
  const employers = RESUME_TIMELINE_FALLBACK.filter((section) =>
    ["Currently", "Experience"].includes(section.title),
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
});

describe("canvasMock", () => {
  it("frames the three featured projects, in order, linked to their case studies", () => {
    expect(canvasMock.frames.map((frame) => frame.slug)).toEqual([
      ...FEATURED_PORTFOLIO_SLUGS,
    ]);
    for (const frame of canvasMock.frames) {
      expect(frame.href).toBe(`/preview/portfolio/${frame.slug}`);
      expect(frame.name.length).toBeGreaterThan(0);
      // No featured project has a shareable screenshot yet (R10): each
      // frame draws its kind of screen instead.
      expect(frame.cover ?? frame.mockup).toBeTruthy();
    }
    expect(caseHref("ventures", "gogocash")).toBe("/preview/ventures/gogocash");
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
      homeHero.location,
    ].join(" ");
    expect(copy).not.toMatch(/\d/);
  });
});
