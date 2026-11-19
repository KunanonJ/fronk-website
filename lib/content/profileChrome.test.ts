import { describe, expect, it } from "vitest";
import {
  PROFILE_BASE,
  availability,
  brand,
  composeHref,
  copyright,
  currentOf,
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
  it("reads Home and its sections from the one base path, the site's root since the cutover", () => {
    // Phase 6 moved the redesign from /preview to the live routes.
    expect(PROFILE_BASE).toBe("");
    expect(homeHref()).toBe("/");
    expect(homeHref("work")).toBe("/#work");
  });

  it("gives the pill nav Work, About, Journey and Résumé (umbrella R1)", () => {
    expect(profileNav.map((link) => [link.label, link.href])).toEqual([
      ["Work", "/#work"],
      ["About", "/#about"],
      ["Journey", "/#journey"],
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

  it("marks Work on the portfolio and the case pages, and Résumé on the résumé", () => {
    const work = profileNav[0]!;
    const resume = profileNav[3]!;
    expect(isCurrentLink(work, "/portfolio")).toBe(true);
    expect(isCurrentLink(work, "/portfolio/tbh-intranet")).toBe(true);
    expect(isCurrentLink(work, "/ventures/gogocash/")).toBe(true);
    expect(isCurrentLink(work, "/")).toBe(false);
    expect(isCurrentLink(work, "/portfolios")).toBe(false);
    expect(isCurrentLink(resume, "/resume")).toBe(true);
    expect(isCurrentLink(profileNav[1]!, "/about")).toBe(true);
    expect(isCurrentLink(profileNav[1]!, "/")).toBe(false);
  });

  it("builds the brand from the person's name", () => {
    expect(brand.firstName).toBe("Kunanon");
    expect(brand.surname).toBe("Jarat");
    expect(brand.label).toBe("Kunanon Jarat, home");
    expect(brand.home).toBe("/");
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

describe("currentOf, the only source of aria-current in the chrome", () => {
  const [work, about, , resume] = profileNav;

  it("marks the Home section in view as a location, and no other section", () => {
    expect(currentOf(about!, "about", "/")).toBe("location");
    expect(currentOf(work!, "about", "/")).toBeUndefined();
  });

  it("marks no section when Home is not the page", () => {
    expect(currentOf(about!, undefined, "/skills")).toBeUndefined();
  });

  it("marks the page the reader is on", () => {
    expect(currentOf(work!, undefined, "/portfolio/tbh-intranet")).toBe("page");
    expect(currentOf(resume!, undefined, "/resume")).toBe("page");
    expect(currentOf(resume!, undefined, "/")).toBeUndefined();
  });
});

describe("the topic hubs in the chrome (Phase 6 review, finding 3)", () => {
  const aiEngineering = profileMenu.find(
    (link) => link.label === "AI engineering",
  )!;
  const fde = "/topics/forward-deployed-ai-engineering";
  /** The menu's links current on `path`, as "Label:value". */
  const marked = (path: string) =>
    profileMenu
      .map((link) => [link.label, currentOf(link, undefined, path)] as const)
      .filter(([, value]) => value !== undefined)
      .map(([label, value]) => `${label}:${value}`);

  it("marks AI engineering on the Thai FDE hub, as on the English one", () => {
    expect(currentOf(aiEngineering, undefined, `/th${fde}`)).toBe("page");
    expect(currentOf(aiEngineering, undefined, `/th${fde}/`)).toBe("page");
    expect(marked(`/th${fde}`)).toEqual(["AI engineering:page"]);
    expect(marked(fde)).toEqual(["AI engineering:page"]);
  });

  it("marks no link on the other hubs: the chrome has no Learn link (spec 7.1, 7.6)", () => {
    expect(profileMenu.map((link) => link.label)).not.toContain("Learn");
    for (const path of [
      "/topics/tech-startup-thailand-sea",
      "/th/topics/tech-startup-thailand-sea",
      "/learn",
    ]) {
      expect(marked(path), path).toEqual([]);
    }
  });

  it("reads /th as Thai only for the hubs: other paths there are not-found pages", () => {
    expect(marked("/th")).toEqual([]);
    expect(marked("/th/resume")).toEqual([]);
    expect(marked("/th/portfolio/tbh-intranet")).toEqual([]);
    expect(marked("/thumbnails/topics/x")).toEqual([]);
  });
});
