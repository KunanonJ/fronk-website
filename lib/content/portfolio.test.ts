import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { primaryNav } from "@/lib/content/landing";
import {
  getAdjacentPortfolioProjects,
  getAllPortfolioProjects,
  getAllPortfolioSlugs,
  getFeaturedPortfolioProjects,
  getPortfolioProjectBySlug,
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

describe("portfolio visuals", () => {
  it("gives every project a visual, a workflow and an architecture", () => {
    for (const p of projects) {
      // A real screenshot or, for an internal tool, a drawn mockup.
      expect(p.cover ?? p.mockup, p.slug).toBeDefined();
      expect(p.workflow, p.slug).toBeDefined();
      expect(p.architecture, p.slug).toBeDefined();
    }
  });

  it("shows a real screenshot only for a public project, and a mockup otherwise", () => {
    for (const p of projects) {
      // An internal tool's screen would show internal data; a public site
      // drawn as a mockup would misrepresent what anyone can open.
      expect(Boolean(p.cover), p.slug).toBe(p.access === "public");
      expect(Boolean(p.mockup), p.slug).toBe(p.access === "internal");
    }
  });

  it("has workflows of 3+ named steps with unique labels", () => {
    for (const p of projects) {
      const steps = p.workflow?.steps ?? [];
      expect(p.workflow?.title.trim(), p.slug).toBeTruthy();
      expect(steps.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(new Set(steps.map((s) => s.label)).size, p.slug).toBe(
        steps.length,
      );
      for (const step of steps) expect(step.label.trim(), p.slug).not.toBe("");
    }
  });

  it("has architectures of 2+ uniquely named layers, each with nodes", () => {
    for (const p of projects) {
      const layers = p.architecture?.layers ?? [];
      expect(layers.length, p.slug).toBeGreaterThanOrEqual(2);
      expect(new Set(layers.map((l) => l.label)).size, p.slug).toBe(
        layers.length,
      );
      for (const layer of layers) {
        expect(layer.nodes.length, `${p.slug} ${layer.label}`).toBeGreaterThan(
          0,
        );
        const labels = layer.nodes.map((n) => n.label);
        expect(new Set(labels).size, `${p.slug} ${layer.label}`).toBe(
          labels.length,
        );
      }
    }
  });

  it("keeps mockup labels short and data-free (no digits)", () => {
    for (const p of projects) {
      const m = p.mockup;
      if (!m) continue;
      const texts =
        m.kind === "app-shell"
          ? [m.title, ...m.nav, ...m.tiles]
          : m.kind === "email-report"
            ? [m.subject, m.status, ...m.columns]
            : m.kind === "form-preview"
              ? [...m.fields, m.action]
              : [m.title, ...m.columns];
      for (const t of texts) {
        expect(t.length, `${p.slug}: ${t}`).toBeLessThanOrEqual(28);
        expect(t, `${p.slug}: ${t}`).not.toMatch(/\d/);
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
});

describe("portfolio nav", () => {
  it("is a top-level link right after Ventures", () => {
    const labels = primaryNav.map((item) => item.label);
    const index = labels.indexOf("Portfolio");
    expect(index).toBe(labels.indexOf("Ventures") + 1);
    expect(primaryNav[index]).toMatchObject({
      type: "link",
      label: "Portfolio",
      href: "/portfolio",
    });
  });
});

describe("featured work (Home)", () => {
  it("lists the canvas order: TBH Intranet, AI Automation, Node Validator", () => {
    expect(getFeaturedPortfolioProjects().map((p) => p.name)).toEqual([
      "TBH Intranet",
      "AI Automation",
      "Node Validator Automation",
    ]);
  });
});
