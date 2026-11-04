import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { nav, primaryNav } from "@/lib/content/landing";
import {
  getAdjacentPortfolioProjects,
  getAllPortfolioProjects,
  getAllPortfolioSlugs,
  getPortfolioProjectBySlug,
  portfolioProjectTitle,
} from "@/lib/content/portfolio";

const projects = getAllPortfolioProjects();

describe("portfolio content", () => {
  it("has projects with unique, URL-safe slugs", () => {
    expect(projects.length).toBeGreaterThan(0);
    const slugs = getAllPortfolioSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("gives every project the copy the cards and detail pages render", () => {
    for (const p of projects) {
      expect(p.name.trim(), p.slug).not.toBe("");
      expect(p.tagline, p.slug).toMatch(/\.$/);
      expect(p.summary.length, p.slug).toBeGreaterThan(40);
      expect(p.category.trim(), p.slug).not.toBe("");
      expect(p.role.trim(), p.slug).not.toBe("");
      expect(p.organization.trim(), p.slug).not.toBe("");
      expect(p.period, p.slug).toMatch(/\d{4}$/);
      expect(p.highlights.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.stack.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(new Set(p.stack).size, p.slug).toBe(p.stack.length);
      for (const section of p.sections) {
        expect(section.heading.trim(), p.slug).not.toBe("");
        expect(section.body.trim(), p.slug).not.toBe("");
      }
    }
  });

  it("only links out from public projects, over https", () => {
    for (const p of projects) {
      if (p.access === "internal") {
        expect(p.url, p.slug).toBeUndefined();
      } else if (p.url) {
        expect(p.url, p.slug).toMatch(/^https:\/\//);
      }
    }
  });

  it("registers only images that exist under public/portfolio/<slug>/", () => {
    for (const p of projects) {
      const images = [...(p.cover ? [p.cover] : []), ...(p.gallery ?? [])];
      for (const image of images) {
        expect(image.src, p.slug).toMatch(
          new RegExp(`^/portfolio/${p.slug}/[^/]+\\.(png|jpe?g|webp|avif)$`),
        );
        expect(image.alt.trim(), image.src).not.toBe("");
        expect(image.width, image.src).toBeGreaterThan(0);
        expect(image.height, image.src).toBeGreaterThan(0);
        expect(
          existsSync(join(process.cwd(), "public", image.src)),
          `missing file public${image.src}`,
        ).toBe(true);
      }
    }
  });
});

describe("portfolio helpers", () => {
  it("looks projects up by slug", () => {
    const first = projects[0]!;
    expect(getPortfolioProjectBySlug(first.slug)).toBe(first);
    expect(getPortfolioProjectBySlug("missing")).toBeNull();
  });

  it("wraps previous / next around the list", () => {
    const first = projects[0]!;
    const last = projects[projects.length - 1]!;
    expect(getAdjacentPortfolioProjects(first.slug).prev).toBe(last);
    expect(getAdjacentPortfolioProjects(last.slug).next).toBe(first);
    expect(getAdjacentPortfolioProjects("missing")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("builds a title without the tagline's trailing period", () => {
    const title = portfolioProjectTitle(projects[0]!);
    expect(title.startsWith(`${projects[0]!.name}: `)).toBe(true);
    expect(title).not.toMatch(/\.$/);
  });
});

describe("portfolio nav", () => {
  it("is a top-level link right after Ventures", () => {
    const labels = primaryNav.map((item) => item.label);
    const index = labels.indexOf("Portfolio");
    expect(index).toBe(labels.indexOf("Ventures") + 1);
    expect(primaryNav[index]).toEqual({
      type: "link",
      label: "Portfolio",
      href: "/portfolio",
    });
  });

  it("is in the flat nav used by scroll-spy helpers", () => {
    expect(nav.some((item) => item.href === "/portfolio")).toBe(true);
  });
});
