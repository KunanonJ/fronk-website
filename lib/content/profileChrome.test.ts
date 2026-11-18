import { describe, expect, it } from "vitest";
import {
  PROFILE_BASE,
  availability,
  brand,
  composeHref,
  copyright,
  footerCopy,
  footerPages,
  homeHref,
  isCurrentLink,
  profileMenu,
  profileNav,
} from "@/lib/content/profileChrome";
import { siteMenu } from "@/lib/content/landing";

/*
 * The chrome's links and copy (profile redesign, Phase 1). Links come from the
 * site's own menus, so a renamed page cannot leave the chrome pointing at it.
 */
describe("profile chrome links", () => {
  it("reads Home and its sections from the one base path", () => {
    expect(PROFILE_BASE).toBe("/preview");
    expect(homeHref()).toBe("/preview");
    expect(homeHref("work")).toBe("/preview#work");
  });

  it("gives the pill nav Work, About, Journey and Résumé (umbrella R1)", () => {
    expect(profileNav.map((link) => [link.label, link.href])).toEqual([
      ["Work", "/preview#work"],
      ["About", "/preview#about"],
      ["Journey", "/preview#journey"],
      ["Résumé", "/resume"],
    ]);
  });

  it("gives the phone menu the same four, then AI engineering and Contact", () => {
    expect(profileMenu.map((link) => link.label)).toEqual([
      "Work",
      "About",
      "Journey",
      "Résumé",
      "AI engineering",
      "Contact",
    ]);
    const ai = siteMenu.rows.find((row) => row.label === "AI engineering");
    expect(profileMenu[4]?.href).toBe(ai?.href);
    expect(profileMenu[5]?.href).toBe("/contact");
  });

  it("lists every page the old site menu links in the footer, and no hidden page", () => {
    const expected = [...siteMenu.rows, ...siteMenu.library, siteMenu.cta];
    expect(footerPages.map((page) => page.href)).toEqual(
      expected.map((item) => item.href),
    );
    expect(footerPages).toHaveLength(13);
    const hrefs = footerPages.map((page) => page.href);
    expect(hrefs).not.toContain("/blog");
    expect(hrefs).not.toContain("/press");
  });

  it("marks Work on the case pages and Résumé on the résumé", () => {
    const work = profileNav[0]!;
    const resume = profileNav[3]!;
    expect(isCurrentLink(work, "/preview/portfolio/tbh-intranet")).toBe(true);
    expect(isCurrentLink(work, "/preview/ventures/gogocash/")).toBe(true);
    expect(isCurrentLink(work, "/preview")).toBe(false);
    expect(isCurrentLink(resume, "/resume")).toBe(true);
  });

  it("builds the brand from the person's name", () => {
    expect(brand.firstName).toBe("Kunanon");
    expect(brand.surname).toBe("Jarat");
    expect(brand.label).toBe("Kunanon Jarat, home");
    expect(brand.home).toBe("/preview");
  });

  it("encodes the Gmail compose address", () => {
    expect(composeHref("fronk.kunanon@gmail.com")).toBe(
      "https://mail.google.com/mail/?view=cm&fs=1&to=fronk.kunanon%40gmail.com",
    );
  });
});

describe("profile chrome copy", () => {
  it("takes the availability line and place from the content modules", () => {
    expect(availability.label).toBe("Open to roles");
    expect(availability.location).toBe("Bangkok, GMT+7");
    expect(copyright(2026)).toBe("© 2026 Kunanon Jarat · Bangkok");
  });

  it("keeps the draft footer copy first person, plain and free of figures", () => {
    const lines = [
      footerCopy.eyebrow,
      footerCopy.headline,
      ...footerCopy.paragraphs,
    ];
    for (const line of lines) {
      expect(line, line).not.toMatch(/\d/);
      expect(line, line).not.toMatch(/—|–/);
      expect(line, line).not.toMatch(/\p{Extended_Pictographic}/u);
    }
    expect(footerCopy.paragraphs[0]).toMatch(/^I build /);
    expect(footerCopy.paragraphs[1]).toMatch(/^I’m open to /);
    expect(footerCopy.paragraphs).toHaveLength(2);
  });
});
