import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMPANY_LOGOS,
  companyInitials,
  companyLogoSrc,
} from "@/lib/content/companyLogos";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";

const root = process.cwd();

describe("self-hosted company logos (ux-audit finding 12)", () => {
  it("every logo is a local file under public/", () => {
    for (const [domain, src] of Object.entries(COMPANY_LOGOS)) {
      expect(src, domain).toMatch(/^\/brand\//);
      expect(existsSync(join(root, "public", src)), `${domain} -> ${src}`).toBe(
        true,
      );
    }
  });

  it("looks domains up case- and www-insensitively", () => {
    expect(companyLogoSrc("Bitkub.com")).toBe(COMPANY_LOGOS["bitkub.com"]);
    expect(companyLogoSrc("www.udemy.com")).toBe(COMPANY_LOGOS["udemy.com"]);
    expect(companyLogoSrc("unknown.example")).toBeUndefined();
    expect(companyLogoSrc(undefined)).toBeUndefined();
  });

  it("falls back to two-letter initials, skipping a leading 'The'", () => {
    expect(companyInitials("The Binary Holdings")).toBe("BH");
    expect(companyInitials("Aiden Labs")).toBe("AL");
    expect(companyInitials("NECTEC")).toBe("NE");
    expect(companyInitials("The")).toBe("TH");
  });

  it("covers the fallback timeline with a logo or initials, never a remote URL", () => {
    const items = RESUME_TIMELINE_FALLBACK.flatMap((section) => section.items);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const src = item.logoSrc ?? companyLogoSrc(item.logoDomain);
      if (src) expect(src.startsWith("/"), item.org).toBe(true);
    }
  });

  it("no source file references the old favicon CDN", () => {
    const host = ["icons", "duckduckgo", "com"].join(".");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(join(root, dir))) {
        const rel = join(dir, name);
        if (statSync(join(root, rel)).isDirectory()) walk(rel);
        else if (
          /\.(tsx?|mjs|css)$/.test(name) &&
          readFileSync(join(root, rel), "utf8").includes(host)
        )
          hits.push(rel);
      }
    };
    for (const dir of ["src", "components", "lib", "scripts"]) walk(dir);
    expect(hits).toEqual([]);
  });
});
